import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, BarChart, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { Survey } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminSurveys: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSurveys = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/surveys/admin');
      setSurveys(response.data?.data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminSurveys.failedToLoadSurveys'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDelete = async (surveyId: string) => {
    try {
      await apiService.delete(`/surveys/admin/${surveyId}`);
      toast({
        title: t('common.success'),
        description: t('adminSurveys.surveyDeletedSuccessfully'),
      });
      loadSurveys();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminSurveys.failedToDeleteSurvey'),
        variant: "destructive"
      });
    }
  };

  const getStatusVariant = (status: 'draft' | 'published' | 'closed'): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'published': return 'default';
      case 'closed': return 'destructive';
      case 'draft':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-purple-600" />
            {t('adminSurveys.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('adminSurveys.createManageViewResults')}
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link to="/admin/surveys/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('adminSurveys.createNewSurvey')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminSurveys.allSurveys')}</CardTitle>
          <CardDescription>{t('adminSurveys.listOfAllSurveys')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>{t('adminSurveys.loadingSurveys')}</p>
          ) : surveys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                <ListChecks className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t('adminSurveys.noSurveysFound')}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('adminSurveys.title')}</TableHead>
                      <TableHead>{t('adminSurveys.status')}</TableHead>
                      <TableHead>{t('adminSurveys.questions')}</TableHead>
                      <TableHead>{t('adminSurveys.points')}</TableHead>
                      <TableHead>{t('adminSurveys.endDate')}</TableHead>
                      <TableHead className="text-right">{t('adminSurveys.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey._id}>
                        <TableCell className="font-medium">{survey.title}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(survey.status)}>{t(`adminSurveys.${survey.status}`)}</Badge>
                        </TableCell>
                        <TableCell>{survey.questions.length}</TableCell>
                        <TableCell>{survey.pointsAwarded}</TableCell>
                        <TableCell>{survey.endDate ? new Date(survey.endDate).toLocaleDateString() : t('adminSurveys.noLimit')}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/admin/surveys/${survey._id}/results`}>
                              <BarChart className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/admin/surveys/edit/${survey._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('adminSurveys.areYouAbsolutelySure')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('adminSurveys.deleteSurveyWarning')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('adminSurveys.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(survey._id)}>
                                  {t('adminSurveys.continue')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <Card key={survey._id}>
                      <CardHeader>
                        <CardTitle>{survey.title}</CardTitle>
                        <Badge variant={getStatusVariant(survey.status)} className="w-fit">{t(`adminSurveys.${survey.status}`)}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-600">
                        <div><strong>{t('adminSurveys.questions')}:</strong> {survey.questions.length}</div>
                        <div><strong>{t('adminSurveys.points')}:</strong> {survey.pointsAwarded}</div>
                        <div><strong>{t('adminSurveys.endDate')}:</strong> {survey.endDate ? new Date(survey.endDate).toLocaleDateString() : t('adminSurveys.noLimit')}</div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2 bg-gray-50/50 p-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/surveys/${survey._id}/results`}>
                              <BarChart className="mr-1 h-4 w-4" /> {t('adminSurveys.results')}
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/surveys/edit/${survey._id}`}>
                              <Edit className="mr-1 h-4 w-4" /> {t('adminSurveys.edit')}
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="mr-1 h-4 w-4" /> {t('adminSurveys.delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('adminSurveys.areYouSure')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('adminSurveys.deleteSurveyWarningShort')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('adminSurveys.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(survey._id)}>
                                  {t('adminSurveys.continue')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSurveys; 