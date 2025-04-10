import { TrendingUp, Users, Globe, Clock } from "lucide-react";

const LiveStats = () => {
  return (
    <div className="bg-background p-6 rounded-3xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Global Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Regions */}
        <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
          <Users className="h-12 w-12 text-primary" />
          <div>
            <div className="text-3xl font-bold">150+</div>
            <div className="text-sm text-muted-foreground">Active Regions Worldwide</div>
          </div>
        </div>

        {/* Opinions Collected */}
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-lg">
          <Globe className="h-12 w-12 text-blue-500" />
          <div>
            <div className="text-3xl font-bold">10M+</div>
            <div className="text-sm text-muted-foreground">Opinions Collected</div>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="flex items-center gap-4 p-4 bg-teal-500/10 rounded-lg">
          <Clock className="h-12 w-12 text-teal-500" />
          <div>
            <div className="text-3xl font-bold">2.4s</div>
            <div className="text-sm text-muted-foreground">Average Response Time</div>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg">
          <TrendingUp className="h-12 w-12 text-green-500" />
          <div>
            <div className="text-3xl font-bold">+12%</div>
            <div className="text-sm text-muted-foreground">Growth Rate This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
