import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tag, Trophy } from 'lucide-react';
import type { Prediction } from '../types';

interface PredictionCardProps {
  prediction: Prediction;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <Link to={`/predictions/${prediction.id}`}>
          {prediction.imageUrl ? (
            <img
              src={prediction.imageUrl}
              alt={prediction.title}
              className="rounded-t-lg aspect-[3/2] object-cover w-full"
            />
          ) : (
            <div className="rounded-t-lg aspect-[3/2] w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-blue-400" />
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-bold hover:text-primary">
          <Link 
            to={`/predictions/${prediction.id}`}
            className="hover:text-primary transition-colors"
          >
            {prediction.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2 text-sm line-clamp-2">
          {prediction.description}
        </CardDescription>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'}>
            {prediction.status}
          </Badge>
          {prediction.winnerId && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Trophy className="h-3 w-3 mr-1" />
              Solved
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-red-600">
            <Tag className="h-3 w-3" />
            <span>Trừ: {prediction.pointsCost}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Trophy className="h-3 w-3" />
            <span>Thưởng: {prediction.rewardPoints || Math.round(prediction.pointsCost * 1.5)}</span>
          </div>
        </div>
        <Button asChild>
          <Link to={`/predictions/${prediction.id}`}>
            Dự đoán
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}; 