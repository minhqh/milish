import TestLayout from './layouts/TestLayout';

export default function App() {
  return (
    <TestLayout>
      <div className="flex flex-col items-center justify-center h-full pt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Question 1: Read a text aloud
        </h2>
        <p className="text-gray-700 text-center max-w-3xl text-lg sm:text-xl leading-relaxed font-serif">
          "Good morning, shoppers! Welcome to Star Supermarket. 
          Today, we are offering a 20% discount on all fresh produce. 
          Please head to the fruit aisle to enjoy this amazing deal."
        </p>
        
        {/* Placeholder cho phần ghi âm */}
        <div className="mt-16 bg-red-50 text-red-600 p-6 rounded-full border border-red-200 animate-pulse font-medium shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
          🎙️ Recording area will go here...
        </div>
      </div>
    </TestLayout>
  )
}