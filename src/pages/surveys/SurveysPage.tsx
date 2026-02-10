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
import { formatDate } from '@/lib/utils';

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />

            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-regular tracking-tight text-gray-900 flex items-center justify-center gap-3">
                    <ListChecks className="h-10 w-10 text-green-600" />
                    {t('surveys.availableSurveys')}
                </h1>
                <p className="text-gray-500 text-lg">
                    {t('surveys.completeToEarnPoints')}
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse border-none shadow-google bg-white">
                            <CardHeader>
                                <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6 mt-2"></div>
                            </CardContent>
                            <CardFooter>
                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : surveys.length === 0 ? (
                <div className="text-center py-16">
                    <ListChecks className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('surveys.noSurveysAvailable')}</h3>
                    <p className="text-gray-500">{t('surveys.checkBackLater')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveys.map(survey => (
                        <Card key={survey._id} className="flex flex-col border-none shadow-google hover:shadow-google-hover transition-all duration-300 bg-white overflow-hidden group">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                                    {survey.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-gray-500 mt-1">
                                    {survey.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4 pt-0">
                                <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full">
                                    <Coins className="h-4 w-4 mr-2" />
                                    <span>{t('surveys.earnPoints', { points: survey.pointsAwarded })}</span>
                                </div>
                                {survey.endDate && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{t('surveys.endsOn')}: {formatDate(survey.endDate)}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-gray-50 bg-gray-50/50">
                                <Button
                                    onClick={() => handleStartSurvey(survey._id)}
                                    className="w-full bg-white text-green-600 border border-gray-200 hover:bg-green-50 shadow-none hover:text-green-700 hover:border-green-200 group/btn"
                                >
                                    {t('surveys.startSurvey')} <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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