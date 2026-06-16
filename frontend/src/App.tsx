import ApiKeyModel from './components/ApiKeyModal';
import WritingWorkspace from './components/WritingWorkspace';
import TestLayout from './layouts/TestLayout';

export default function App() {
  return (
    <TestLayout>
      <ApiKeyModel />
      <div className="flex flex-col items-center justify-center h-full pt-8">
        {/* Đổi đề bài sang TOEIC Writing Part 3 */}
        <div className="w-full max-w-4xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Question 8: Write an opinion essay
          </h2>
          <p className="text-gray-800 text-lg leading-relaxed font-medium">
            "Some people prefer to work for a large company, while others prefer to work for a small company. Which do you prefer? Use specific reasons and examples to support your opinion."
          </p>
        </div>
        
        {/* Chèn Khu vực làm bài Writing vào đây */}
        <WritingWorkspace />
      </div>
      </TestLayout>
  )
}