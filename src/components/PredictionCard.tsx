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
          <img
            src={prediction.imageUrl}
            alt={prediction.title}
            className="rounded-t-lg aspect-[3/2] object-cover w-full"
          />
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
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Tag className="h-4 w-4" />
          <span>{prediction.pointsCost} Points</span>
        </div>
        <Button asChild>
          <Link to={`/predictions/${prediction.id}`}>
            Make Prediction
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}; 