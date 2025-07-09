import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import type { Survey, SurveyQuestion } from '@/types';
import { useAuth } from '@/context/AuthContext';

type FormValues = {
  [key: string]: string | string[];
};

const SurveyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshUser } = useAuth();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

    const { register, handleSubmit, control, watch, setValue } = useForm<FormValues>({
        defaultValues: {}
    });

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        apiService.get(`/surveys/${id}`)
            .then(res => setSurvey(res.data.data))
            .catch(err => {
                if (err.response?.status === 403) {
                    setIsAlreadyCompleted(true);
                } else {
                    setError(err.response?.data?.message || 'Failed to load survey.');
                }
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        const answers = survey?.questions.map(q => {
            const value = data[q._id];
            const otherValue = data[`${q._id}_other`];

            if (q.type === 'multiple-choice') {
                const answerArray = Array.isArray(value) ? value as string[] : [];
                return {
                    questionId: q._id,
                    answer: answerArray,
                    otherText: otherValue as string || undefined
                };
            }
            return {
                questionId: q._id,
                answer: value ? [value as string] : [],
            };
        }).filter(Boolean);
        
        try {
            const response = await apiService.post(`/surveys/${id}/submit`, { answers });
            toast({
                title: response.data.data?.isFraudulent ? "Submission Flagged" : "Success!",
                description: response.data.message,
                variant: response.data.data?.isFraudulent ? "destructive" : "default"
            });
            await refreshUser(); // Refresh user points
            navigate('/surveys');
        } catch (error: any) {
            toast({
                title: "Submission Error",
                description: error.response?.data?.message || 'Could not submit your answers.',
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Loading survey...</p>;

    if (isAlreadyCompleted) {
        return (
            <Card className="text-center">
                 <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-2xl">Survey Already Completed</CardTitle>
                    <CardDescription className="mt-2 text-base">
                        Thank you! You have already submitted your answers for this survey.
                    </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild>
                        <Link to="/surveys">Back to Surveys List</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (error) return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );

    if (!survey) return <p>Survey not found.</p>;

    const renderQuestion = (q: SurveyQuestion) => {
        const fieldName = q._id;
        switch (q.type) {
            case 'short-text':
                return <Input {...register(fieldName, { required: q.isRequired })} />;
            case 'long-text':
                return <Textarea {...register(fieldName, { required: q.isRequired })} />;
            case 'single-choice':
                return (
                    <Controller
                        name={fieldName}
                        control={control}
                        rules={{ required: q.isRequired }}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value as string} className="space-y-2">
                                {q.options.map(opt => (
                                    <div key={opt._id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                                        <RadioGroupItem value={opt.text} id={`${fieldName}-${opt._id}`} />
                                        <Label htmlFor={`${fieldName}-${opt._id}`} className="flex-1 cursor-pointer">{opt.text}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    />
                );
            case 'multiple-choice': {
                const otherFieldName = `${fieldName}_other`;
                const watchedValues: string[] = watch(fieldName, []) as string[];

                return (
                    <div className="space-y-2">
                        {q.options.map(opt => (
                            <div key={opt._id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                               <Controller
                                    name={fieldName}
                                    control={control}
                                    defaultValue={[]}
                                    render={({ field }) => {
                                        const value = (field.value || []) as string[];
                                        return (
                                            <Checkbox
                                                id={`${fieldName}-${opt._id}`}
                                                checked={value.includes(opt.text)}
                                                onCheckedChange={(checked: boolean) => {
                                                    const currentValues = value;
                                                    if(checked) {
                                                        field.onChange([...currentValues, opt.text]);
                                                    } else {
                                                        field.onChange(currentValues.filter((v: string) => v !== opt.text));
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                />
                                <Label htmlFor={`${fieldName}-${opt._id}`} className="flex-1 cursor-pointer">{opt.text}</Label>
                            </div>
                        ))}
                        {/* "Other" checkbox */}
                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                             <Controller
                                name={fieldName}
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => {
                                    const value = (field.value || []) as string[];
                                    return (
                                    <Checkbox
                                        id={`${fieldName}-other-checkbox`}
                                        checked={value.includes("Other")}
                                        onCheckedChange={(checked: boolean) => {
                                            const currentValues = value;
                                            if (checked) {
                                                field.onChange([...currentValues, "Other"]);
                                            } else {
                                                field.onChange(currentValues.filter((v: string) => v !== "Other"));
                                                setValue(otherFieldName, ''); // Clear other text field
                                            }
                                        }}
                                    />
                                )}}
                            />
                            <Label htmlFor={`${fieldName}-other-checkbox`} className="flex-1 cursor-pointer">Other</Label>
                        </div>
                        {/* "Other" text input */}
                        {watchedValues.includes("Other") && (
                             <Input
                                {...register(otherFieldName)}
                                placeholder="Please specify"
                                className="mt-2"
                            />
                        )}
                    </div>
                );
            }
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {survey.questions.map((q, index) => (
                        <div key={q._id} className="p-4 border rounded-lg bg-white shadow-sm">
                            <Label className="font-semibold text-base leading-relaxed">
                                <span className="text-blue-600 font-bold mr-2">Q{index + 1}:</span>
                                {q.text}
                                {q.isRequired && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            <div className="mt-4 pl-2 border-l-2 border-blue-100">{renderQuestion(q)}</div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                        {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default SurveyDetailPage; 