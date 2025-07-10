import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Trash2, PlusCircle, AlertTriangle, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
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
        <Card className="relative bg-gray-50/50 p-4 border">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                         {dragHandleProps && (
                            <div {...dragHandleProps} className="cursor-grab p-1">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                        <Label className="text-lg">Question {index + 1}</Label>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>

                <Controller
                    name={`questions.${index}.text`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Input {...field} placeholder="Enter your question" />
                            {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        name={`questions.${index}.type`}
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select question type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short-text">Short Text</SelectItem>
                                    <SelectItem value="long-text">Long Text</SelectItem>
                                    <SelectItem value="single-choice">Single Choice (Radio)</SelectItem>
                                    <SelectItem value="multiple-choice">Multiple Choice (Checkbox)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                     <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                           <Controller name={`questions.${index}.isRequired`} control={control} render={({ field }) => <Switch id={`isRequired-${index}`} checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label htmlFor={`isRequired-${index}`}>Required</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller name={`questions.${index}.isAntiFraud`} control={control} render={({ field }) => <Switch id={`isAntiFraud-${index}`} checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label htmlFor={`isAntiFraud-${index}`}>Anti-Fraud</Label>
                        </div>
                    </div>
                </div>

                {isAntiFraud && (
                     <div className="p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                        <p className="text-xs flex items-center gap-1"><AlertTriangle size={14}/> This is an anti-fraud question. All options must have a Group ID.</p>
                    </div>
                )}
                
                {showOptions && (
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium">Options</h4>
                        {fields.map((option, optionIndex) => (
                             <div key={option.id} className="flex items-center gap-2">
                                <Controller name={`questions.${index}.options.${optionIndex}.text`} control={control} render={({ field, fieldState }) => (
                                     <div className="flex-grow">
                                        <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                                         {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                    </div>
                                )} />
                                {isAntiFraud && (
                                     <Controller name={`questions.${index}.options.${optionIndex}.antiFraudGroupId`} control={control} render={({ field, fieldState }) => (
                                         <div className="w-48">
                                            <Input {...field} placeholder="Group ID"/>
                                            {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                         </div>
                                     )} />
                                )}
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', antiFraudGroupId: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
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
        <div ref={setNodeRef} style={style} {...attributes}>
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
        if (isEditMode) {
            setIsLoading(true);
            apiService.get(`/surveys/admin/${id}`)
                .then(response => {
                    const surveyData = response.data.data;
                    reset({
                        ...surveyData,
                        endDate: surveyData.endDate ? new Date(surveyData.endDate).toISOString().split('T')[0] : ''
                    });
                })
                .catch(err => {
                    toast({ title: 'Error fetching survey', description: err.message, variant: 'destructive' });
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEditMode, reset]);

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
                toast({ title: 'Success', description: 'Survey updated successfully.' });
            } else {
                await apiService.post('/surveys/admin', data);
                toast({ title: 'Success', description: 'Survey created successfully.' });
            }
            navigate('/admin/surveys');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'An error occurred.',
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
        return <p>Loading survey form...</p>;
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Survey' : 'Create New Survey'}</h1>
                    <p className="text-gray-600 mt-2">Fill in the details below.</p>
                </div>
                <div className="flex gap-2">
                     <Button type="button" variant="outline" onClick={() => navigate('/admin/surveys')}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Survey'}</Button>
                </div>
            </div>

            {/* Main Survey Details */}
            <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Survey Title</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pointsAwarded">Points Awarded</Label>
                            <Input id="pointsAwarded" type="number" {...register('pointsAwarded')} />
                            {errors.pointsAwarded && <p className="text-sm text-destructive">{errors.pointsAwarded.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input id="endDate" type="date" {...register('endDate')} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Section */}
            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Questions</CardTitle>
                        <Button type="button" size="sm" onClick={addQuestion}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    {errors.questions && !errors.questions.root && <p className="text-sm font-medium text-destructive">{errors.questions.message}</p>}
                     {errors.questions?.root?.message && <p className="text-sm font-medium text-destructive">{errors.questions.root.message}</p>}
                </CardContent>
            </Card>
        </form>
    );
};

export default AdminSurveyForm; 