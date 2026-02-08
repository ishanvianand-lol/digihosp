import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface HealthScoreGaugeProps {
  score: number;
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'from-green-500 to-emerald-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreStatus = () => {
    if (score >= 70) {
      return {
        icon: TrendingUp,
        text: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    } else if (score >= 40) {
      return {
        icon: Activity,
        text: 'Moderate',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    } else {
      return {
        icon: AlertTriangle,
        text: 'At Risk',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }
  };

  const status = getScoreStatus();
  const StatusIcon = status.icon;
  const percentage = (score / 100) * 360;

  return (
    <div className="card-medical overflow-hidden">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${getScoreColor()} p-4 text-white`}>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="font-semibold">Overall Health Score</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Circular Progress */}
        <div className="relative mx-auto mb-6 h-48 w-48">
          {/* Background Circle */}
          <svg className="h-48 w-48 -rotate-90 transform">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="16"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="url(#gradient)"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(percentage / 360) * 502.4} 502.4`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
                />
                <stop
                  offset="100%"
                  stopColor={score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'}
                />
              </linearGradient>
            </defs>
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold bg-gradient-to-br ${getScoreColor()} bg-clip-text text-transparent`}>
              {score}
            </span>
            <span className="text-lg text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center justify-center gap-2 rounded-full border ${status.borderColor} ${status.bgColor} px-6 py-3`}>
          <StatusIcon className={`h-5 w-5 ${status.color}`} />
          <span className={`font-semibold ${status.color}`}>{status.text} Health</span>
        </div>

        {/* Breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-center">
            <p className="text-xs font-medium text-green-700">Sleep</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.min(100, score + Math.floor(Math.random() * 20))}%
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-center">
            <p className="text-xs font-medium text-blue-700">Activity</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.min(100, score + Math.floor(Math.random() * 15))}%
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-3 text-center">
            <p className="text-xs font-medium text-purple-700">Diet</p>
            <p className="text-2xl font-bold text-purple-600">
              {Math.min(100, score + Math.floor(Math.random() * 10))}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}