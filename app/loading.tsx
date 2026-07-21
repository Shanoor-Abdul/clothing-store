const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-10 w-1/3 rounded-full bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="h-6 w-2/3 rounded-full bg-slate-200" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 rounded-full bg-slate-200" />
              <div className="h-4 w-1/2 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="h-6 w-2/3 rounded-full bg-slate-200" />
            <div className="grid gap-3">
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-3/4 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="h-6 w-2/3 rounded-full bg-slate-200" />
            <div className="grid gap-3">
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-full rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
