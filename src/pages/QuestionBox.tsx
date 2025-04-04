import React, { useState, useEffect } from "react";

interface ProblemData {
  questionLink: string;
  difficulty: string;
  questionName: string;
  intuition: string;
  dateAdded: string;
  id?: number;
}

const ProblemInputForm: React.FC = () => {
  const [formData, setFormData] = useState<ProblemData>({
    questionLink: "",
    difficulty: "",
    questionName: "",
    intuition: "",
    dateAdded: "",
  });

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTime, setNotificationTime] = useState({
    date: "",
    time: "",
  });

  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [showProblemsModal, setShowProblemsModal] = useState<boolean>(false);

  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(["dsaProblems"], function (result) {
        if (result.dsaProblems) {
          setProblems(result.dsaProblems);
        }
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDifficultyChange = (difficulty: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      difficulty,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (
      !formData.questionLink ||
      !formData.questionName ||
      !formData.difficulty ||
      !formData.intuition
    ) {
      setSaveStatus("Please fill all fields");
      return;
    }

    const newProblem: ProblemData = {
      ...formData,
      dateAdded: new Date().toISOString(),
      id: Date.now(),
    };

    const updatedProblems: ProblemData[] = [...problems, newProblem];
    setProblems(updatedProblems);

    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ dsaProblems: updatedProblems }, function () {
        setSaveStatus("Problem saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      });
    } else {
      console.error("Chrome sync storage API not available");
      setSaveStatus("Error: Storage not available");
    }

    setFormData({
      questionLink: "",
      difficulty: "",
      questionName: "",
      intuition: "",
      dateAdded: "",
    });
  };


  const handleNotifyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowNotificationModal(true);
  };

  const handleViewAllProblems = () => {
    setShowProblemsModal(true);
  };

  // / Add this function to save the notification
 // background.js

// Debugging: Log when background script loads
console.log("Background script initialized");

// Improved notification function
function showNotification(problemText:any) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/codeAnalyzer.png',
    title: 'DSA Revision Buddy',
    message: `Time to practice: ${problemText}`,
    priority: 2
  });
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);
  const problemText = alarm.name.replace('notification_', '');
  showNotification(problemText);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request.type);
  
  if (request.type === 'SET_NOTIFICATION') {
    const alarmName = `notification_${request.problemText}`;
    
    console.log(`Creating alarm for: ${alarmName} at ${new Date(request.notificationTime)}`);
    
    chrome.alarms.create(alarmName, {
      when: request.notificationTime
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Alarm creation failed:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
      } else {
        console.log("Alarm created successfully");
        sendResponse({ success: true });
      }
    });
    
    return true; // Required to keep the message channel open for sendResponse
  }
  
  // Add this for testing notifications manually
  if (request.type === 'TEST_NOTIFICATION') {
    showNotification("Test notification working!");
    sendResponse({ success: true });
    return true;
  }
  });


  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [problemText, setProblemText] = useState<string>("");

  const saveNotification = (problem: string, time: Date) => {
    console.log("Setting alarm for:", problem, "at", time.toString());
    
    chrome.runtime.sendMessage({
      type: 'SET_NOTIFICATION',
      notificationTime: time.getTime(),
      problemText: problem
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
        setSaveStatus(`Error: ${chrome.runtime.lastError.message}`);
        return;
      }
      
      console.log("Response:", response);
      if (response?.success) {
        setShowNotificationModal(false);
        setSaveStatus(`Reminder set for "${problem}" at ${time.toLocaleString()}`);
      } else {
        setSaveStatus(`Error: ${response?.error || 'Failed to set reminder'}`);
      }
    });
  };

  const handleSubmitNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (problemText && notificationTime.date && notificationTime.time) {
      const notificationDateTime = new Date(
        `${notificationTime.date}T${notificationTime.time}`
      );
      saveNotification(problemText, notificationDateTime);
    }
  };
  
  

  const getDifficultyClass = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-medium text-gray-800 mb-4">
        Add New DSA Problem
      </h3>

      {saveStatus && (
        <div
          className={`p-3 mb-4 rounded-md ${
            saveStatus.includes("Error") || saveStatus.includes("Please fill")
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="questionLink"
            className="block text-sm font-medium text-gray-700"
          >
            Question Link
          </label>
          <input
            type="url"
            id="questionLink"
            name="questionLink"
            value={formData.questionLink}
            onChange={handleChange}
            placeholder="https://leetcode.com/problems/example-problem"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Difficulty Level
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleDifficultyChange("Easy")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium ${
                formData.difficulty === "Easy"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              Easy
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange("Medium")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium ${
                formData.difficulty === "Medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange("Hard")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium ${
                formData.difficulty === "Hard"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="questionName"
            className="block text-sm font-medium text-gray-700"
          >
            Question Name
          </label>
          <input
            type="text"
            id="questionName"
            name="questionName"
            value={formData.questionName}
            onChange={handleChange}
            placeholder="Two Sum, Binary Tree Level Order Traversal, etc."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="intuition"
            className="block text-sm font-medium text-gray-700"
          >
            What's Your Intuition
          </label>
          <textarea
            id="intuition"
            name="intuition"
            value={formData.intuition}
            onChange={handleChange}
            placeholder="Describe your approach and thought process for solving this problem..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div className="flex flex-row gap-4 w-full">
          <button
            type="submit"
            className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Problem
          </button>
          <button
            type="button"
            onClick={handleNotifyClick}
            className="flex-1 cursor-pointer px-6 py-3 bg-slate-950 text-white font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Notify Me
          </button>
          <button
            type="button"
            onClick={handleViewAllProblems}
            className="flex-1 cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            View All Problems
          </button>
        </div>
      </form>

      {/* Notification Modal */}
{showNotificationModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-96 p-6">
      <h3 className="text-xl font-medium text-gray-800 mb-4">
        Set Notification
      </h3>
      <form onSubmit={handleSubmitNotification}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem to Remind About
            </label>
            <input
              type="text"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="Which problem should we remind you about?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={notificationTime.date}
              onChange={(e) =>
                setNotificationTime((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={notificationTime.time}
              onChange={(e) =>
                setNotificationTime((prev) => ({
                  ...prev,
                  time: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setShowNotificationModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set Notification
          </button>
        </div>
      </form>
    </div>
  </div>
)}






      {/* Problems Modal */}
      {showProblemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-800">
                All DSA Problems
              </h3>
              <button
                onClick={() => setShowProblemsModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-grow">
              {problems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No problems saved yet. Add your first DSA problem!
                </p>
              ) : (
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <div
                      key={problem.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-lg text-gray-800">
                          {problem.questionName}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyClass(problem.difficulty)}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>

                      <div className="mb-2">
                        <a
                          href={problem.questionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {problem.questionLink}
                        </a>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Added on:</strong>{" "}
                        {formatDate(problem.dateAdded)}
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Your Intuition:
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {problem.intuition}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowProblemsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemInputForm;