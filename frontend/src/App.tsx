import TestLayout from './layouts/TestLayout';
import ApiKeyModal from './components/ApiKeyModal';
import SpeakingWorkspace from './components/SpeakingWorkspace'; // IMPORT COMPONENT MỚI

export default function App() {
  return (
    <TestLayout>
      <ApiKeyModal />
      <div className="flex flex-col items-center justify-start h-full pt-4 w-full">
        
        {/* Đổi đề bài sang TOEIC Speaking Part 2 */}
        <div className="w-full max-w-3xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Question 3: Describe a picture
          </h2>
          <p className="text-gray-700 text-base mb-4 font-medium">
            Directions: In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to speak.
          </p>
          <div className="w-full flex justify-center bg-white p-2 rounded border border-gray-200">
             {/* Một ảnh Placeholder cho thí sinh miêu tả */}
             <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" alt="People in meeting" className="rounded max-h-64 object-cover" />
          </div>
        </div>
        
        {/* NẠP COMPONENT GHI ÂM VÀO ĐÂY */}
        <SpeakingWorkspace 
          question="Describe a picture of people having a meeting in an office."
          testId={"bdb75c46-da1f-470a-aaf2-a5027aee4be9"}
          sessionId={
              localStorage.getItem('session_id')
              || 'anonymous_user_' + Date.now()
          }
          questionIndex={1} 
        />
        
      </div>
    </TestLayout>
  )
}