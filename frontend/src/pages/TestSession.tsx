import TestLayout from '../layouts/TestLayout';
import SpeakingWorkspace from '../components/SpeakingWorkspace';
import WritingWorkspace from '../components/WritingWorkspace';

export default function TestSession() {
  const sessionId = localStorage.getItem('user_id') || 'anonymous';
  const testId = "bdb75c46-da1f-470a-aaf2-a5027aee4be9"; // Vẫn đang hardcode tạm để test

  return (
    <TestLayout>
      <div className="flex flex-col items-center justify-start h-full pt-4 w-full pb-20">
        
        {/* Câu hỏi Speaking */}
        <div className="w-full max-w-3xl bg-blue-50 border-l-4 border-blue-600 p-6 rounded mb-2">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Question 3: Describe a picture
          </h2>
          <p className="text-gray-700 text-base mb-4 font-medium">
            Directions: In this part of the test, you will describe the picture on your screen in as much detail as you can. You will have 45 seconds to speak.
          </p>
          <div className="w-full flex justify-center bg-white p-2 rounded border border-gray-200">
             <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop" alt="People in meeting" className="rounded max-h-64 object-cover" />
          </div>
        </div>
        
        <SpeakingWorkspace 
          question="Describe a picture of people having a meeting in an office."
          testId={testId}
          sessionId={sessionId}
          questionIndex={1} 
        />

        {/* Demo thả luôn Writing vào đây để test UI, sau này sẽ tách riêng từng câu hỏi */}
        <div className="w-full max-w-3xl mt-10 border-t-2 border-dashed border-gray-300 pt-10">
          <WritingWorkspace
            question="Do you agree or disagree with the following statement? Learning online is more effective than traditional classroom learning."
            testId={testId}
            sessionId={sessionId}
            questionIndex={2} 
          />
        </div>

      </div>
    </TestLayout>
  );
}