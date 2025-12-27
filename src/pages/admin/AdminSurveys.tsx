import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, BarChart, ListChecks, FileText, Calendar, Coins, Plus } from 'lucide-react';
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

  const getStatusVariant = (status: 'draft' | 'published' | 'closed'): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'published': return 'default';
      case 'closed': return 'destructive';
      case 'draft':
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('adminSurveys.loadingSurveys')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-blue-600" />
            {t('adminSurveys.title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('adminSurveys.createManageViewResults')}
          </p>
        </div>
        <Button asChild className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-11">
          <Link to="/admin/surveys/new">
            <Plus className="h-5 w-5" />
            <span className="font-medium">{t('adminSurveys.createNewSurvey')}</span>
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            {t('adminSurveys.allSurveys')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">{t('adminSurveys.listOfAllSurveys')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {surveys.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListChecks className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('adminSurveys.noSurveysFound')}</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">{t('adminSurveys.createFirstSurveyDescription')}</p>
              <Button asChild variant="outline">
                <Link to="/admin/surveys/new">
                  {t('adminSurveys.createNewSurvey')}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.title')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.status')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('adminSurveys.questions')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('adminSurveys.points')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.endDate')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('adminSurveys.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {surveys.map((survey) => (
                      <TableRow key={survey._id} className="hover:bg-gray-50/80 transition-colors">
                        <TableCell className="px-6 py-4 font-medium text-gray-900">{survey.title}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant={getStatusVariant(survey.status)} className="capitalize font-normal shadow-sm">
                            {t(`adminSurveys.${survey.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-full h-6 w-6 text-xs font-medium">
                            {survey.questions.length}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Coins className="h-3 w-3 text-orange-400" />
                            {survey.pointsAwarded}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-500">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {survey.endDate ? new Date(survey.endDate).toLocaleDateString() : <span className="text-gray-400 italic">{t('adminSurveys.noLimit')}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                              <Link to={`/admin/surveys/${survey._id}/results`} title={t('adminSurveys.viewResults')}>
                                <BarChart className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                              <Link to={`/admin/surveys/edit/${survey._id}`} title={t('adminSurveys.edit')}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
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
                                  <AlertDialogAction onClick={() => handleDelete(survey._id)} className="bg-red-600 hover:bg-red-700 text-white">
                                    {t('adminSurveys.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4 bg-gray-50">
                {surveys.map((survey) => (
                  <Card key={survey._id} className="border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-900">{survey.title}</CardTitle>
                        <Badge variant={getStatusVariant(survey.status)} className="capitalize font-normal">
                          {t(`adminSurveys.${survey.status}`)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{survey.questions.length} {t('adminSurveys.questions')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Coins className="h-4 w-4 text-orange-400" />
                          <span>{survey.pointsAwarded} {t('adminSurveys.points')}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{survey.endDate ? new Date(survey.endDate).toLocaleDateString() : t('adminSurveys.noLimit')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                      <Button variant="outline" size="sm" asChild className="h-8">
                        <Link to={`/admin/surveys/${survey._id}/results`}>
                          <BarChart className="mr-1 h-3.5 w-3.5" /> {t('adminSurveys.results')}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-8">
                        <Link to={`/admin/surveys/edit/${survey._id}`}>
                          <Edit className="mr-1 h-3.5 w-3.5" /> {t('adminSurveys.edit')}
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="h-8">
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> {t('adminSurveys.delete')}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSurveys;