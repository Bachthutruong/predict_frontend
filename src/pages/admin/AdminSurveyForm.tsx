import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '../../components/ui/switch';
import {
    Trash2,
    PlusCircle,
    AlertTriangle,
    GripVertical,
    ArrowLeft,
    Save,
    Loader2,
    FileQuestion,
    List,
    Calendar,
    Coins,
    LayoutList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { useLanguage } from '@/hooks/useLanguage';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    //   arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Zod Schema for validation
const optionSchema = z.object({
    text: z.string().min(1, 'Option text cannot be empty'),
    antiFraudGroupId: z.string().optional(),
});

const questionSchema = z.object({
    _id: z.string().optional(),
    text: z.string().min(3, 'Question text must be at least 3 characters'),
    type: z.enum(['short-text', 'long-text', 'single-choice', 'multiple-choice']),
    isRequired: z.boolean(),
    isAntiFraud: z.boolean(),
    options: z.array(optionSchema),
});

const surveySchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    status: z.enum(['draft', 'published', 'closed']),
    pointsAwarded: z.coerce.number().min(0, 'Points cannot be negative'),
    endDate: z.string().optional(),
    questions: z.array(questionSchema)
        .min(1, 'A survey must have at least one question.')
        .refine(questions => {
            const antiFraudCount = questions.filter(q => q.isAntiFraud).length;
            return antiFraudCount === 0 || antiFraudCount >= 2;
        }, {
            message: 'If using anti-fraud, you must have at least two anti-fraud questions.',
            path: ['questions']
        })
        .refine(questions => {
            const antiFraudQuestions = questions.filter(q => q.isAntiFraud);
            for (const q of antiFraudQuestions) {
                if (q.options.some(opt => !opt.antiFraudGroupId)) {
                    return false;
                }
            }
            return true;
        }, {
            message: 'All options in an anti-fraud question must have an Anti-Fraud Group ID.',
            path: ['questions']
        })
});

type SurveyFormData = z.infer<typeof surveySchema>;

interface QuestionCardProps {
    control: any;
    index: number;
    remove: (index: number) => void;
    dragHandleProps?: any;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ control, index, remove, dragHandleProps }) => {
    const { t } = useLanguage();
    const { fields, append, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${index}.options`
    });

    const questionType = useWatch({
        control,
        name: `questions.${index}.type`,
    });

    const isAntiFraud = useWatch({
        control,
        name: `questions.${index}.isAntiFraud`,
    });

    const showOptions = ['single-choice', 'multiple-choice'].includes(questionType);

    return (
        <Card className="relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        {dragHandleProps && (
                            <div {...dragHandleProps} className="cursor-grab p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                <GripVertical className="h-5 w-5" />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase min-w-[3rem] text-center">
                                Q {index + 1}
                            </span>
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <Controller
                    name={`questions.${index}.text`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="space-y-1">
                            <Label className="sr-only">{t('adminSurveys.question')} {index + 1}</Label>
                            <Input {...field} placeholder={t('adminSurveys.questionPlaceholder')} className="text-lg font-medium border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-500 placeholder:text-gray-300" />
                            {fieldState.error && <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg">
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminSurveys.type')}</Label>
                        <Controller
                            name={`questions.${index}.type`}
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-white border-gray-200"><SelectValue placeholder={t('adminSurveys.selectQuestionType')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short-text">{t('adminSurveys.shortText')}</SelectItem>
                                        <SelectItem value="long-text">{t('adminSurveys.longText')}</SelectItem>
                                        <SelectItem value="single-choice">{t('adminSurveys.singleChoice')}</SelectItem>
                                        <SelectItem value="multiple-choice">{t('adminSurveys.multipleChoice')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="flex flex-col justify-end space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`isRequired-${index}`} className="text-sm text-gray-700 cursor-pointer">{t('adminSurveys.required')}</Label>
                            <Controller name={`questions.${index}.isRequired`} control={control} render={({ field }) => <Switch id={`isRequired-${index}`} checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`isAntiFraud-${index}`} className="text-sm text-gray-700 cursor-pointer">{t('adminSurveys.antiFraud')}</Label>
                            <Controller name={`questions.${index}.isAntiFraud`} control={control} render={({ field }) => <Switch id={`isAntiFraud-${index}`} checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                    </div>
                </div>

                {isAntiFraud && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">{t('adminSurveys.antiFraudWarning')}</p>
                    </div>
                )}

                {showOptions && (
                    <div className="space-y-3 pt-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">{t('adminSurveys.options')}</Label>
                        <div className="space-y-2">
                            {fields.map((option, optionIndex) => (
                                <div key={option.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="h-2 w-2 rounded-full bg-gray-300 flex-shrink-0" />
                                    <Controller name={`questions.${index}.options.${optionIndex}.text`} control={control} render={({ field, fieldState }) => (
                                        <div className="flex-grow">
                                            <Input {...field} placeholder={`${t('adminSurveys.option')} ${optionIndex + 1}`} className="bg-white" />
                                            {fieldState.error && <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>}
                                        </div>
                                    )} />
                                    {isAntiFraud && (
                                        <Controller name={`questions.${index}.options.${optionIndex}.antiFraudGroupId`} control={control} render={({ field, fieldState }) => (
                                            <div className="w-32 md:w-48">
                                                <Input {...field} placeholder={t('adminSurveys.groupId')} className="bg-white font-mono text-xs" />
                                                {fieldState.error && <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>}
                                            </div>
                                        )} />
                                    )}
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', antiFraudGroupId: '' })} className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                            <PlusCircle className="mr-2 h-4 w-4" /> {t('adminSurveys.addOption')}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const SortableQuestionCard = ({ control, index, remove, id }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="mb-4">
            <QuestionCard
                control={control}
                index={index}
                remove={remove}
                dragHandleProps={listeners}
            />
        </div>
    );
}


const AdminSurveyForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();
    const isEditMode = Boolean(id);
    const [isLoading, setIsLoading] = useState(false);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<SurveyFormData>({
        resolver: zodResolver(surveySchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'draft',
            pointsAwarded: 0,
            endDate: '',
            questions: [],
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "questions"
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isEditMode && id) {
            setIsLoading(true);
            apiService.get(`/surveys/admin/${id}`)
                .then(response => {
                    const surveyData = response.data.data;
                    reset({
                        ...surveyData,
                        endDate: surveyData.endDate ? new Date(surveyData.endDate).toISOString().split('T')[0] : ''
                    });
                })
                .catch(() => {
                    toast({
                        title: t('common.error'),
                        description: t('adminSurveys.errorFetchingSurvey'),
                        variant: 'destructive'
                    });
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditMode]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = fields.findIndex(item => item.id === active.id);
            const newIndex = fields.findIndex(item => item.id === over.id);
            move(oldIndex, newIndex);
        }
    };

    const onSubmit = async (data: SurveyFormData) => {
        setIsLoading(true);
        try {
            if (isEditMode) {
                await apiService.put(`/surveys/admin/${id}`, data);
                toast({
                    title: t('common.success'),
                    description: t('adminSurveys.surveyUpdatedSuccessfully')
                });
            } else {
                await apiService.post('/surveys/admin', data);
                toast({
                    title: t('common.success'),
                    description: t('adminSurveys.surveyCreatedSuccessfully')
                });
            }
            navigate('/admin/surveys');
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || t('adminSurveys.errorOccurred'),
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const addQuestion = () => {
        append({
            text: '',
            type: 'short-text',
            isRequired: false,
            isAntiFraud: false,
            options: []
        });
    };

    if (isLoading && isEditMode) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg text-gray-600">{t('adminSurveys.loadingSurveyForm')}</div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto max-w-full space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="space-y-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/admin/surveys')}
                        className="pl-0 gap-2 text-gray-500 hover:text-gray-900 hover:bg-transparent transition-colors -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('common.back')}</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileQuestion className="h-8 w-8 text-blue-600" />
                        {isEditMode ? t('adminSurveys.editSurvey') : t('adminSurveys.createNewSurveyForm')}
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        {t('adminSurveys.fillInDetails')}
                    </p>
                </div>
                <div className="flex gap-3 pt-8">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/surveys')} className="px-6 h-11 border-gray-200 hover:bg-gray-50 text-gray-700">{t('adminSurveys.cancel')}</Button>
                    <Button type="submit" disabled={isLoading} className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t('adminSurveys.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {t('adminSurveys.saveSurvey')}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Survey Details */}
            <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
                <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6 sm:px-8">
                    <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                        <LayoutList className="h-5 w-5 text-gray-500" />
                        {t('adminSurveys.basicInformation')}
                    </CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                        {t('adminSurveys.basicInfoDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">{t('adminSurveys.surveyTitle')} <span className="text-red-500">*</span></Label>
                            <Input id="title" {...register('title')} className="h-12 text-lg px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg" placeholder={t('adminSurveys.surveyTitlePlaceholder')} />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">{t('adminSurveys.status')}</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-11 border-gray-200 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">{t('adminSurveys.draft')}</SelectItem>
                                                <SelectItem value="published">{t('adminSurveys.published')}</SelectItem>
                                                <SelectItem value="closed">{t('adminSurveys.closed')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pointsAwarded" className="text-sm font-semibold text-gray-700 flex items-center gap-1"><Coins className="h-4 w-4 text-gray-500" /> {t('adminSurveys.pointsAwarded')}</Label>
                                <Input id="pointsAwarded" type="number" {...register('pointsAwarded')} className="h-11 border-gray-200" />
                                {errors.pointsAwarded && <p className="text-sm text-red-500">{errors.pointsAwarded.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-500" /> {t('adminSurveys.endDateOptional')}</Label>
                                <Input id="endDate" type="date" {...register('endDate')} className="h-11 border-gray-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">{t('adminSurveys.description')}</Label>
                            <Textarea id="description" {...register('description')} rows={4} className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-100 transition-all rounded-lg p-4" placeholder={t('adminSurveys.surveyDescriptionPlaceholder')} />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <List className="h-6 w-6 text-blue-600" />
                        {t('adminSurveys.questions')}
                        <span className="bg-gray-100 text-gray-600 text-sm font-normal px-2.5 py-0.5 rounded-full">{fields.length}</span>
                    </h2>
                    <Button type="button" onClick={addQuestion} className="gap-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm hover:shadow">
                        <PlusCircle className="h-4 w-4" /> {t('adminSurveys.addQuestion')}
                    </Button>
                </div>

                <div className="bg-transparent space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fields.map(field => field.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {fields.map((field, index) => (
                                <SortableQuestionCard
                                    key={field.id}
                                    id={field.id}
                                    index={index}
                                    control={control}
                                    remove={remove}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {fields.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <FileQuestion className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">{t('adminSurveys.noQuestionsYet')}</p>
                            <Button type="button" variant="link" onClick={addQuestion} className="text-blue-600 mt-2">
                                {t('adminSurveys.addFirstQuestion')}
                            </Button>
                        </div>
                    )}

                    {errors.questions && !errors.questions.root && <p className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded">{errors.questions.message}</p>}
                    {errors.questions?.root?.message && <p className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded">{errors.questions.root.message}</p>}
                </div>
            </div>
        </form>
    );
};

export default AdminSurveyForm;