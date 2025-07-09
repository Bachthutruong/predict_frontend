import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users, AlertTriangle, CheckCircle, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { Survey, SurveySubmission } from '@/types';
import FileSaver from 'file-saver';

// Define a color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminSurveyResults: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;
        
        const loadData = async () => {
            setIsLoading(true);
            try {
                const surveyRes = await apiService.get(`/surveys/admin/${id}`);
                setSurvey(surveyRes.data.data);

                const submissionsRes = await apiService.get(`/surveys/admin/${id}/submissions`);
                setSubmissions(submissionsRes.data.data);

                // Process data for charts
                if (surveyRes.data.data && submissionsRes.data.data) {
                    const currentSurvey: Survey = surveyRes.data.data;
                    const currentSubmissions: SurveySubmission[] = submissionsRes.data.data;

                    const dataForCharts = currentSurvey.questions
                        .filter(q => ['single-choice', 'multiple-choice'].includes(q.type))
                        .map(question => {
                            const answerCounts = new Map<string, number>();

                            question.options.forEach(opt => answerCounts.set(opt.text, 0));
                            if (question.type === 'multiple-choice') {
                                // Account for a potential "Other" answer not in predefined options
                                answerCounts.set('Other', 0);
                            }

                            currentSubmissions.forEach(sub => {
                                const submissionAnswer = sub.answers.find(a => a.questionId === question._id);
                                if (submissionAnswer?.answer) {
                                    submissionAnswer.answer.forEach(ans => {
                                        answerCounts.set(ans, (answerCounts.get(ans) || 0) + 1);
                                    });
                                }
                            });

                            const chartFormattedData = Array.from(answerCounts.entries())
                                .map(([name, count]) => ({ name, count }))
                                .filter(item => item.count > 0); // Only show answers that were actually chosen

                            return {
                                questionId: question._id,
                                questionText: question.text,
                                data: chartFormattedData,
                            };
                        });
                    
                    setChartData(dataForCharts.filter(c => c.data.length > 0));
                }

            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || 'Failed to load survey results',
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleExport = async () => {
        if (!survey) {
            toast({ title: 'Error', description: 'Survey data is not available.', variant: 'destructive' });
            return;
        }

        try {
            const response = await apiService.get(`/surveys/admin/${id}/export`, {
                responseType: 'blob', // Important for file downloads
            });
            
            // Sanitize the survey title for the filename, same logic as backend
            const safeFileName = survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            FileSaver.saveAs(blob, `submissions_${safeFileName}.xlsx`);
            
            toast({ title: 'Success', description: 'Export started successfully.' });
        } catch (error: any) {
             toast({
                title: "Export Error",
                description: error.message || 'Could not export the file.',
                variant: "destructive"
            });
        }
    };
    
    if (isLoading) {
        return <p>Loading survey results...</p>;
    }

    if (!survey) {
        return <p>Survey not found.</p>;
    }

    // const totalSubmissions = submissions.length;
    // const fraudulentSubmissions = submissions.filter(s => s.isFraudulent).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                       <PieChart className="h-8 w-8 text-blue-600" />
                       Survey Results
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Results for: <span className="font-semibold">{survey?.title}</span>
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link to="/admin/surveys">Back to Surveys</Link>
                    </Button>
                    <Button onClick={handleExport} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Export to Excel
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fraudulent Submissions</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissions.filter(s => s.isFraudulent).length}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valid Submissions</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissions.length - submissions.filter(s => s.isFraudulent).length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Individual Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No submissions yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Submitted At</TableHead>
                                            <TableHead>Fraudulent?</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map(sub => (
                                            <TableRow key={sub._id}>
                                                <TableCell>{sub.user?.name || 'N/A'}</TableCell>
                                                <TableCell>{sub.user?.email || 'N/A'}</TableCell>
                                                <TableCell>{new Date(sub.submittedAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {sub.isFraudulent ? (
                                                        <Badge variant="destructive">Yes</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">No</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {/* We can add a "View Details" button here later */}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block md:hidden space-y-4">
                                {submissions.map(sub => (
                                    <Card key={sub._id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{sub.user?.name || 'N/A'}</CardTitle>
                                            <CardDescription>{sub.user?.email || 'N/A'}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                            <div>
                                                Fraudulent: {sub.isFraudulent ? (
                                                    <Badge variant="destructive">Yes</Badge>
                                                ) : (
                                                    <Badge variant="secondary">No</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* NEW: Answer Statistics Section */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Answer Statistics</CardTitle>
                        <CardDescription>Visual summary of answers for choice-based questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-12">
                        {chartData.map((chart) => (
                            <div key={chart.questionId}>
                                <h3 className="font-semibold mb-4 text-lg">{chart.questionText}</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chart.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" name="Submissions" >
                                            {chart.data.map(( i: number) => (
                                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminSurveyResults; 