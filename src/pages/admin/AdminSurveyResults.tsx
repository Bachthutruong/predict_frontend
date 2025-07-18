import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowLeft, Download, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import apiService from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('adminSurveys.surveyNotFound')}</p>
        <Button asChild className="mt-4">
          <Link to="/admin/surveys">
            {t('adminSurveys.backToSurveys')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/surveys">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('adminSurveys.surveyResults')}
            </h1>
            <p className="text-gray-600">
              {t('adminSurveys.resultsFor')} {survey.title}
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? t('common.loading') : t('adminSurveys.exportToExcel')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminSurveys.totalSubmissions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{results.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminSurveys.validSubmissions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{validSubmissions.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('adminSurveys.fraudulentSubmissions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">{fraudulentSubmissions.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminSurveys.individualSubmissions')}</CardTitle>
          <CardDescription>
            {results.length === 0 ? t('adminSurveys.noSubmissionsYet') : `${results.length} ${t('adminSurveys.submissions')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminSurveys.user')}</TableHead>
                  <TableHead>{t('adminSurveys.email')}</TableHead>
                  <TableHead>{t('adminSurveys.submittedAt')}</TableHead>
                  <TableHead>{t('adminSurveys.fraudulent')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.user.name}</TableCell>
                    <TableCell>{result.user.email}</TableCell>
                    <TableCell>
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={result.isFraudulent ? 'destructive' : 'default'}>
                        {result.isFraudulent ? t('adminSurveys.yes') : t('adminSurveys.no')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('adminSurveys.noSubmissionsYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {survey.questions.some(q => q.type === 'singleChoice' || q.type === 'multipleChoice') && (
        <Card>
          <CardHeader>
            <CardTitle>{t('adminSurveys.answerStatistics')}</CardTitle>
            <CardDescription>
              {t('adminSurveys.visualSummary')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {survey.questions
                .filter(q => q.type === 'singleChoice' || q.type === 'multipleChoice')
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
                    <div key={question.id} className="space-y-3">
                      <h3 className="font-medium text-gray-900">{question.text}</h3>
                      <div className="space-y-2">
                        {question.options?.map((option) => {
                          const count = optionCounts[option.text] || 0;
                          const percentage = validSubmissions.length > 0 
                            ? Math.round((count / validSubmissions.length) * 100) 
                            : 0;

                          return (
                            <div key={option.id} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{option.text}</span>
                                  <span>{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
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
      )}
    </div>
  );
};

export default AdminSurveyResults; 