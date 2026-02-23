interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = 'min-h-[50vh]' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
