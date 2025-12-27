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
    <Card className="flex flex-col border-none shadow-google hover:shadow-google-hover transition-all duration-200 h-full bg-white overflow-hidden group">
      <CardHeader className="p-0 relative">
        <Link to={`/predictions/${prediction.id}`} className="block overflow-hidden">
          {prediction.imageUrl ? (
            <img
              src={prediction.imageUrl}
              alt={prediction.title}
              className="aspect-[3/2] object-cover w-full transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="aspect-[3/2] w-full bg-blue-50 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-blue-200" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={prediction.status === 'active' ? 'default' : 'secondary'} className={`shadow-sm ${prediction.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
              {prediction.status}
            </Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4 sm:p-5 flex flex-col">
        <div className="mb-2">
          {prediction.winnerId && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mb-2 w-fit">
              <Trophy className="h-3 w-3 mr-1" />
              Solved
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-medium leading-snug text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          <Link to={`/predictions/${prediction.id}`}>
            {prediction.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 line-clamp-2">
          {prediction.description}
        </CardDescription>

        <div className="mt-auto pt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium">{prediction.pointsCost} points</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-md">
            <Trophy className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium">Win {prediction.rewardPoints || Math.round(prediction.pointsCost * 1.5)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-5 pt-0">
        <Button asChild className="w-full bg-white text-blue-600 border border-gray-200 hover:bg-blue-50 shadow-none hover:border-blue-200 font-medium rounded-lg">
          <Link to={`/predictions/${prediction.id}`}>
            Make Prediction
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}; 