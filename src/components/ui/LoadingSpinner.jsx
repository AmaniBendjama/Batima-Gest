export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-border-main"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin"></div>
      </div>
    </div>
  )
}
