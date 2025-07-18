import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, Coins, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import apiService, { publicApiService } from '@/services/api';
import type { Survey } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const SurveysPage: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

    useEffect(() => {
        const loadSurveys = async () => {
            setIsLoading(true);
            try {
                // Use public API service for guests, authenticated service for logged-in users
                const service = user ? apiService : publicApiService;
                const endpoint = user ? '/surveys' : '/surveys/public';
                const response = await service.get(endpoint);
                setSurveys(response.data?.data || []);
            } catch (error: any) {
                toast({
                    title: t('common.error'),
                    description: error.response?.data?.message || t('surveys.failedToLoad'),
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadSurveys();
    }, [user]);

    const handleStartSurvey = (surveyId: string) => {
        if (!user) {
            setSelectedSurveyId(surveyId);
            setShowAuthModal(true);
        } else {
            // Navigate to survey detail page for logged-in users
            navigate(`/surveys/${surveyId}`);
        }
    };

    const handleAuthSuccess = () => {
        if (selectedSurveyId) {
            navigate(`/surveys/${selectedSurveyId}`);
            setSelectedSurveyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ListChecks className="h-8 w-8 text-green-600" />
                        {t('surveys.availableSurveys')}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('surveys.completeToEarnPoints')}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6 mt-2"></div>
                            </CardContent>
                            <CardFooter>
                                 <div className="h-10 bg-gray-200 rounded w-full"></div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : surveys.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-lg">
                    <ListChecks className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold">{t('surveys.noSurveysAvailable')}</h3>
                    <p className="mt-2">{t('surveys.checkBackLater')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveys.map(survey => (
                        <Card key={survey._id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{survey.title}</CardTitle>
                                <CardDescription>{survey.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <div className="flex items-center text-sm text-gray-600">
                                   <Coins className="h-4 w-4 mr-2 text-yellow-500" />
                                   <span>{t('surveys.earnPoints', { points: survey.pointsAwarded })}</span>
                               </div>
                               {survey.endDate && (
                                   <div className="flex items-center text-sm text-gray-600">
                                       <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                       <span>{t('surveys.endsOn')}: {new Date(survey.endDate).toLocaleDateString()}</span>
                                   </div>
                               )}
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    onClick={() => handleStartSurvey(survey._id)}
                                    className="w-full"
                                >
                                    {t('surveys.startSurvey')} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SurveysPage; 