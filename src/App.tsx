import React, { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeFoodImage, assessHealthRisk, getDailyHealthTip, getSupplementSuggestions } from './services/geminiService';
import { addHistoryEntry } from './services/historyService';
import * as authService from './services/authService';
import { getSettings } from './services/settingsService';
import { FoodAnalysis, HealthRiskAssessment, HistoryEntry, NutritionalInfo, User, SupplementSuggestion } from './types';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import Chatbot from './components/Chatbot';
import History from './components/History';
import Settings from './components/Settings';
import NotificationModal from './components/NotificationModal';
import AnalyzeIcon from './components/icons/AnalyzeIcon';
import ChatIcon from './components/icons/ChatIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import SettingsIcon from './components/icons/SettingsIcon';
import LoginPrompt from './components/LoginPrompt';

type Tab = 'analyzer' | 'chat' | 'history' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [baseAnalysis, setBaseAnalysis] = useState<FoodAnalysis | null>(null);
  const [risks, setRisks] = useState<HealthRiskAssessment | null>(null);
  const [supplementSuggestions, setSupplementSuggestions] = useState<SupplementSuggestion[]>([]);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({ meal: '', tip: '' });
  const notifiedTimes = useRef<string[]>([]);

  useEffect(() => {
    // Check for an existing session on component mount
    setUser(authService.getCurrentUser());
  }, []);
  
  // Proactive Meal Reminders Logic
  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    const checkReminders = async () => {
      const settings = getSettings();
      if (!settings.mealReminders.enabled) return;

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const meals = {
        'Breakfast': settings.mealReminders.breakfast,
        'Lunch': settings.mealReminders.lunch,
        'Dinner': settings.mealReminders.dinner,
      };

      for (const [meal, time] of Object.entries(meals)) {
        const notificationId = `${currentDate}-${time}`;
        if (currentTime === time && !notifiedTimes.current.includes(notificationId)) {
          notifiedTimes.current.push(notificationId);
          
          // Show notification
          const tip = await getDailyHealthTip();
          setNotificationContent({ meal, tip });
          setShowNotification(true);
          break; // Show only one notification per minute check
        }
      }
    };
    
    // Reset notified times at the start of a new day
    const resetNotified = () => {
        const today = new Date().toISOString().split('T')[0];
        notifiedTimes.current = notifiedTimes.current.filter(id => id.startsWith(today));
    };

    resetNotified();
    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    const dailyResetId = setInterval(resetNotified, 60 * 60 * 1000); // Reset every hour to be safe

    return () => {
      clearInterval(intervalId);
      clearInterval(dailyResetId);
    };
  }, [user]);

  const resetAnalysisState = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setAnalysis(null);
    setBaseAnalysis(null);
    setRisks(null);
    setError(null);
    setPortionMultiplier(1);
    setActiveTab('analyzer');
    setSupplementSuggestions([]);
  };

  const handleLogin = () => {
    const loggedInUser = authService.login();
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    resetAnalysisState();
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setRisks(null);
    setError(null);
    setSupplementSuggestions([]);
  };

  const performInitialAnalysis = useCallback(async (base64Image: string, imageType: string, correctedName?: string) => {
    setIsProcessing(true);
    setError(null);
    if (!correctedName) {
      setAnalysis(null);
      setRisks(null);
      setBaseAnalysis(null);
      setSupplementSuggestions([]);
    }
    
    try {
      const foodAnalysis = await analyzeFoodImage(base64Image, imageType, correctedName);
      setBaseAnalysis(foodAnalysis);
      setAnalysis(foodAnalysis);
      setPortionMultiplier(1);
      
      const healthRisks = await assessHealthRisk(foodAnalysis.nutritionalInfo);
      setRisks(healthRisks);

      // Fetch supplement suggestions if opted-in
      const settings = getSettings();
      if (settings.showSupplementSuggestions) {
        const suggestions = await getSupplementSuggestions(healthRisks);
        setSupplementSuggestions(suggestions);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;
    const base64Image = await fileToBase64(imageFile);
    await performInitialAnalysis(base64Image, imageFile.type);
  }, [imageFile, performInitialAnalysis]);

  const handleUpdateAnalysis = useCallback(async (correctedName: string) => {
    if (!imageFile) {
        setError("Original image not found. Please start over by selecting the image again.");
        return;
    }
    const base64Image = await fileToBase64(imageFile);
    await performInitialAnalysis(base64Image, imageFile.type, correctedName);
  }, [imageFile, performInitialAnalysis]);
  
  const handlePortionChange = useCallback(async (newMultiplier: number) => {
    if (!baseAnalysis || newMultiplier <= 0) return;

    setPortionMultiplier(newMultiplier);
    setIsProcessing(true);
    setError(null);
    setSupplementSuggestions([]);

    try {
      const baseNutrients = baseAnalysis.nutritionalInfo;
      const adjustedNutrients: NutritionalInfo = {
        ...baseNutrients,
        estimatedWeight: baseNutrients.estimatedWeight * newMultiplier,
        calories: baseNutrients.calories * newMultiplier,
        protein: baseNutrients.protein * newMultiplier,
        carbohydrates: {
          total: baseNutrients.carbohydrates.total * newMultiplier,
          sugar: baseNutrients.carbohydrates.sugar * newMultiplier,
        },
        fat: {
          total: baseNutrients.fat.total * newMultiplier,
          saturated: baseNutrients.fat.saturated * newMultiplier,
        },
        sodium: baseNutrients.sodium * newMultiplier,
        cholesterol: baseNutrients.cholesterol * newMultiplier,
      };

      setAnalysis({
        ...baseAnalysis,
        nutritionalInfo: adjustedNutrients,
      });

      const healthRisks = await assessHealthRisk(adjustedNutrients);
      setRisks(healthRisks);
      
      const settings = getSettings();
      if (settings.showSupplementSuggestions) {
        const suggestions = await getSupplementSuggestions(healthRisks);
        setSupplementSuggestions(suggestions);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while adjusting portion.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [baseAnalysis]);

  const handleSaveAndReset = () => {
    if (analysis && risks) {
      const historyEntry: HistoryEntry = {
        analysis,
        risks,
        timestamp: new Date().toISOString(),
        portionMultiplier,
      };
      addHistoryEntry(historyEntry);
    }
    resetAnalysisState();
  };

  const TabButton: React.FC<{tabName: Tab, label: string, Icon: React.ElementType}> = ({tabName, label, Icon}) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-t-lg transition-colors ${
        activeTab === tabName
          ? 'bg-white text-teal-600 border-b-4 border-teal-500'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      {showNotification && (
        <NotificationModal
          meal={notificationContent.meal}
          tip={notificationContent.tip}
          onClose={() => setShowNotification(false)}
        />
      )}
      <main className="container mx-auto p-4 md:p-6 w-full flex-1 flex flex-col">
          {!user ? (
            <LoginPrompt onLogin={handleLogin} />
          ) : (
            <>
              <div className="w-full max-w-2xl mx-auto flex mb-4">
                  <TabButton tabName="analyzer" label="Analyzer" Icon={AnalyzeIcon} />
                  <TabButton tabName="history" label="History" Icon={HistoryIcon} />
                  <TabButton tabName="chat" label="AI Chat" Icon={ChatIcon} />
                  <TabButton tabName="settings" label="Settings" Icon={SettingsIcon} />
              </div>

              {activeTab === 'analyzer' && (
                  <div className="w-full">
                    {!analysis && !isProcessing && (
                      <ImageUploader 
                          onImageSelect={handleImageSelect}
                          onAnalyze={handleAnalyze}
                          isLoading={isProcessing}
                          imagePreviewUrl={imagePreviewUrl}
                      />
                    )}

                    {isProcessing && !analysis && <Loader message={'Analyzing food image...'} />}

                    {error && (
                        <div className="w-full max-w-2xl mx-auto my-4 p-4 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <p className="font-bold">Operation Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {analysis && risks && (
                      <>
                        <AnalysisResult 
                          analysis={analysis} 
                          risks={risks} 
                          onUpdate={handleUpdateAnalysis}
                          isUpdating={isProcessing}
                          portionMultiplier={portionMultiplier}
                          onPortionChange={handlePortionChange}
                          supplementSuggestions={supplementSuggestions}
                        />
                        <div className="text-center mt-6">
                            <button 
                              onClick={handleSaveAndReset} 
                              disabled={isProcessing}
                              className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                                Save & Analyze New Food
                            </button>
                        </div>
                      </>
                    )}
                  </div>
              )}

              {activeTab === 'history' && (
                  <History />
              )}

              {activeTab === 'chat' && (
                  <Chatbot />
              )}

              {activeTab === 'settings' && (
                  <Settings />
              )}
            </>
          )}
      </main>
      <footer className="w-full text-center py-4 text-sm text-slate-500">
        <p>NutriSnap AI is for informational purposes only and is not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
};

export default App;