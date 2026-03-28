import { TrendingUp, Users, ShieldCheck } from 'lucide-react';

export function StatsSection() {
  return (
    <div className="border-y border-border bg-muted-bg py-8">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <TrendingUp className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-2xl font-bold text-foreground">6.8%</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Avg. Yield</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <Users className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-2xl font-bold text-foreground">12.5k</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Investors</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <h3 className="font-display text-2xl font-bold text-foreground">€52M</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Funded</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <ShieldCheck className="w-5 h-5 text-primary-500 mb-2" />
            <h3 className="font-display text-lg font-bold text-foreground mt-1">Regulated</h3>
            <p className="text-[12px] text-muted uppercase tracking-wider font-semibold mt-1">Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
