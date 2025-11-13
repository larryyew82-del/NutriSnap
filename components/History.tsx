import React, { useState, useEffect, useMemo } from 'react';
import { getHistoryEntries } from '../services/historyService';
import { getSettings } from '../services/settingsService';
import { HistoryEntry, HealthRiskAssessment, Settings } from '../types';

type FilterPeriod = 'daily' | 'weekly' | 'monthly';

const RiskMeter: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const percentage = (score / 10) * 100;
    let color = 'bg-green-500';
    if (score > 4) color = 'bg-yellow-500';
    if (score > 7) color = 'bg-red-500';
  
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className={`font-bold text-base ${color.replace('bg-', 'text-')}`}>{score.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
};

const DailySummary: React.FC<{ dailyHistory: HistoryEntry[], goals: Settings['dailyGoals'] }> = ({ dailyHistory, goals }) => {
    const dailyTotals = useMemo(() => {
        return dailyHistory.reduce((acc, entry) => {
            acc.calories += entry.analysis.nutritionalInfo.calories;
            acc.protein += entry.analysis.nutritionalInfo.protein;
            acc.carbs += entry.analysis.nutritionalInfo.carbohydrates.total;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0 });
    }, [dailyHistory]);

    const ProgressTracker: React.FC<{ label: string, current: number, goal: number, unit: string }> = ({ label, current, goal, unit }) => {
        const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
        return (
            <div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <span className="text-xs text-slate-500">{current.toFixed(0)} / {goal} {unit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                        className="h-3 rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Daily Goal Progress</h3>
            <div className="space-y-4">
                <ProgressTracker label="Calories" current={dailyTotals.calories} goal={goals.calories} unit="kcal" />
                <ProgressTracker label="Protein" current={dailyTotals.protein} goal={goals.protein} unit="g" />
                <ProgressTracker label="Carbs" current={dailyTotals.carbs} goal={goals.carbs} unit="g" />
            </div>
        </div>
    );
};


const History: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [filter, setFilter] = useState<FilterPeriod>('daily');
    const [settings, setSettings] = useState<Settings>(getSettings());

    useEffect(() => {
        setHistory(getHistoryEntries());
        setSettings(getSettings());
    }, []);

    const filteredHistory = useMemo(() => {
        const now = new Date();
        return history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            if (filter === 'daily') {
                return entryDate.toDateString() === now.toDateString();
            }
            if (filter === 'weekly') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return entryDate >= oneWeekAgo;
            }
            if (filter === 'monthly') {
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return entryDate >= oneMonthAgo;
            }
            return false;
        });
    }, [history, filter]);

    const averageRisks = useMemo<HealthRiskAssessment | null>(() => {
        if (filteredHistory.length === 0) return null;
        
        const totalRisks = filteredHistory.reduce((acc, entry) => {
            acc.diabetes += entry.risks.diabetes.score;
            acc.hypertension += entry.risks.hypertension.score;
            acc.cholesterol += entry.risks.cholesterol.score;
            return acc;
        }, { diabetes: 0, hypertension: 0, cholesterol: 0 });

        const count = filteredHistory.length;
        return {
            diabetes: { score: totalRisks.diabetes / count, reasoning: '' },
            hypertension: { score: totalRisks.hypertension / count, reasoning: '' },
            cholesterol: { score: totalRisks.cholesterol / count, reasoning: '' },
        };
    }, [filteredHistory]);

    const FilterButton: React.FC<{period: FilterPeriod, label: string}> = ({ period, label }) => (
        <button
            onClick={() => setFilter(period)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                filter === period ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex justify-center space-x-2">
                    <FilterButton period="daily" label="Daily" />
                    <FilterButton period="weekly" label="Weekly" />
                    <FilterButton period="monthly" label="Monthly" />
                </div>
            </div>
            
            {filter === 'daily' && (
                <DailySummary dailyHistory={filteredHistory} goals={settings.dailyGoals} />
            )}

            {averageRisks && (
                 <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Average Risk Assessment</h3>
                    <div className="space-y-4">
                        <RiskMeter score={averageRisks.diabetes.score} label="Avg. Diabetes Risk" />
                        <RiskMeter score={averageRisks.hypertension.score} label="Avg. Hypertension Risk" />
                        <RiskMeter score={averageRisks.cholesterol.score} label="Avg. Cholesterol Risk" />
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Consumption Log</h3>
                {filteredHistory.length > 0 ? (
                    <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {filteredHistory.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-bold text-slate-700">
                                      {entry.analysis.nutritionalInfo.foodName}
                                      {entry.portionMultiplier !== 1 && (
                                        <span className="ml-2 font-normal text-sm text-slate-500">
                                            ({entry.portionMultiplier}x portion)
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-teal-600">{entry.analysis.nutritionalInfo.calories.toFixed(0)} kcal</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 py-8">
                        No food logged for this period. Analyze a meal to get started!
                    </p>
                )}
            </div>
        </div>
    );
};

export default History;
