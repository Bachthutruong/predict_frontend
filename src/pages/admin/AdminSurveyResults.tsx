import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowLeft, Download, Users, CheckCircle, AlertTriangle, FileText, Activity, PieChart } from 'lucide-react';
import apiService from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDateTime } from '../../lib/utils';

interface SurveyResult {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  isFraudulent: boolean;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
  }>;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  points: number;
  endDate?: string;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options?: Array<{
      id: string;
      text: string;
      groupId?: string;
    }>;
  }>;
}

const AdminSurveyResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchSurveyResults = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [surveyResponse, resultsResponse] = await Promise.all([
        apiService.get(`/surveys/admin/${id}`),
        apiService.get(`/surveys/admin/${id}/submissions`)
      ]);

      if (surveyResponse.data?.success && surveyResponse.data?.data) {
        setSurvey(surveyResponse.data.data);
      }

      if (resultsResponse.data?.success && resultsResponse.data?.data) {
        setResults(resultsResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch survey results:', error);
      toast({
        title: t('common.error'),
        description: t('adminSurveys.failedToLoadResults'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyResults();
  }, [id]);

  const handleExport = async () => {
    if (!id) return;

    try {
      setExporting(true);
      const response = await apiService.get(`/surveys/admin/${id}/export`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey_results_${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: t('common.success'),
        description: t('adminSurveys.exportStartedSuccessfully'),
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to export results:', error);
      toast({
        title: t('adminSurveys.exportError'),
        description: t('adminSurveys.couldNotExportFile'),
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const validSubmissions = results.filter(result => !result.isFraudulent);
  const fraudulentSubmissions = results.filter(result => result.isFraudulent);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container mx-auto p-6 sm:p-8 max-w-5xl text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('adminSurveys.surveyNotFound')}</h1>
          <Button asChild variant="outline">
            <Link to="/admin/surveys">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('adminSurveys.backToSurveys')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2">
            <Link to="/admin/surveys">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            {t('adminSurveys.surveyResults')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('adminSurveys.resultsFor')} <span className="font-semibold text-gray-800">{survey.title}</span>
          </p>
        </div>
        <div className="pt-8">
          <Button onClick={handleExport} disabled={exporting} className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? t('common.loading') : t('adminSurveys.exportToExcel')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{results.length}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminSurveys.totalSubmissions')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{validSubmissions.length}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminSurveys.validSubmissions')}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{fraudulentSubmissions.length}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">{t('adminSurveys.fraudulentSubmissions')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Answer Stats */}
        {survey.questions.some(q => q.type === 'single-choice' || q.type === 'multiple-choice') ? (
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl lg:col-span-2">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-gray-500" />
                {t('adminSurveys.answerStatistics')}
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('adminSurveys.visualSummary')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid hidden:grid-cols-1 md:grid-cols-2 gap-8">
                {survey.questions
                  .filter(q => q.type === 'single-choice' || q.type === 'multiple-choice')
                  .map((question) => {
                    const questionResults = validSubmissions.flatMap(result =>
                      result.answers.filter(answer => answer.questionId === question.id)
                    );

                    const optionCounts: { [key: string]: number } = {};
                    question.options?.forEach(option => {
                      optionCounts[option.text] = 0;
                    });

                    questionResults.forEach(result => {
                      const answers = result.answer.split(',').map(a => a.trim());
                      answers.forEach(answer => {
                        if (optionCounts.hasOwnProperty(answer)) {
                          optionCounts[answer]++;
                        }
                      });
                    });

                    return (
                      <div key={question.id} className="space-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">{question.text}</h3>
                        <div className="space-y-4">
                          {question.options?.map((option) => {
                            const count = optionCounts[option.text] || 0;
                            const percentage = validSubmissions.length > 0
                              ? Math.round((count / validSubmissions.length) * 100)
                              : 0;

                            return (
                              <div key={option.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700 font-medium">{option.text}</span>
                                  <span className="text-gray-500">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="lg:col-span-2 text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
            No statistical questions (choice-based) found in this survey.
          </div>
        )}

        {/* Submissions List */}
        <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl lg:col-span-2">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              {t('adminSurveys.individualSubmissions')}
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              {results.length === 0 ? t('adminSurveys.noSubmissionsYet') : `${results.length} ${t('adminSurveys.submissions')}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.user')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.email')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.submittedAt')}</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('adminSurveys.fraudulent')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className="hover:bg-gray-50/50">
                        <TableCell className="px-6 py-4 font-medium text-gray-900">{result.user.name}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-600">{result.user.email}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-500">
                          {formatDateTime(result.submittedAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant={result.isFraudulent ? 'destructive' : 'default'} className={`font-normal ${result.isFraudulent ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}>
                            {result.isFraudulent ? (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {t('adminSurveys.yes')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('adminSurveys.no')}
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('adminSurveys.noSubmissionsYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default AdminSurveyResults;