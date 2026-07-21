const StoreLoading = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-1/3 rounded-full bg-slate-200" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-[1.5rem] bg-slate-200"
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-1/4 rounded-full bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-48 rounded-[1.65rem] bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLoading;
