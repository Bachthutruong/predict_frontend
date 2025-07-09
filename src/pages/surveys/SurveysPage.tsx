import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, Coins, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { Survey } from '@/types';

const SurveysPage: React.FC = () => {
    const { toast } = useToast();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSurveys = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.get('/surveys');
                setSurveys(response.data?.data || []);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || 'Failed to load available surveys',
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadSurveys();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ListChecks className="h-8 w-8 text-green-600" />
                        Available Surveys
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Complete a survey to earn points!
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
                    <h3 className="text-xl font-semibold">No Surveys Available</h3>
                    <p className="mt-2">Please check back later for new surveys.</p>
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
                                   <span>Earn {survey.pointsAwarded} points</span>
                               </div>
                               {survey.endDate && (
                                   <div className="flex items-center text-sm text-gray-600">
                                       <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                       <span>Ends on: {new Date(survey.endDate).toLocaleDateString()}</span>
                                   </div>
                               )}
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link to={`/surveys/${survey._id}`}>
                                        Start Survey <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
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