import React, { useEffect } from 'react';
import Navbar from '../components/Navbar'; // Đảm bảo đường dẫn này đúng
import './Home.css'; // Giữ lại nếu bạn có CSS tùy chỉnh không phải Tailwind
import { useLogout } from '../features/auth/Logout';
export default function Home() {
  const logout = useLogout();
    useEffect(() => {

    }, []);

    return (
        <div className="dark"> {/* Class 'dark' trên body được chuyển lên div gốc */}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] space-y-2" id="toast-container" data-turbo-permanent="">
                {/* <div className="bg-blue-500 text-white p-3 rounded shadow-lg">Your toast message here</div> */}
                {/* Toast messages will be rendered here */}
            </div>

            {/* Logout Form */}
            <form id="frm-logout" action="https://cp.green.cloud/logout" method="POST" className="hidden">
                <input type="hidden" name="_token" autoComplete="off" value="jMhLMcPtoVxM6XRWHySnK4dGLzUmxL6woKUNt2cW" />
            </form>

            {/* Navbar Component */}
            <Navbar credits={150} />

            {/* Main Content Container */}
            <div className="container mx-auto px-4 mt-20 md:mt-24"> {/* Tăng margin-top để tránh Navbar */}
                {/* Header Section */}
                <div className="hidden md:block">
                    <div className="flex justify-between items-center gap-3 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-300">Greetings, <span className="text-gray-400">Tuan Thanh</span></h1>
                            <p className="text-gray-300">Dashboard</p>
                        </div>
                        <div className="flex justify-end items-center gap-1 md:gap-3">
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-gray-200" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"></path>
                                </svg>
                                <span className="hidden md:block whitespace-nowrap text-gray-200">Account</span>
                            </div>
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-gray-200" viewBox="0 0 16 16">
                                    <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2zm1 13h8V2H4v13z"></path>
                                    <path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"></path>
                                </svg>
                                <button
  className="hidden md:inline-block whitespace-nowrap px-3 py-1 text-sm text-white  rounded-md transition"
     onClick={logout}
>
  Logout
</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account, Notifications, Traffic Consumption Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="col-span-1">
                        <div className="shadow-sm bg-white dark:bg-gray-800 rounded-lg h-full">
                            <div className="p-4 xl:p-6 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">Account</h4>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer">tuanthanhxp1901@gmail.com</span>
                                </div>
                                <div className="space-y-2"> {/* box-inset tương đương với padding và border nhẹ */}
                                    <div className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                                        <div className="text-gray-700 dark:text-gray-300">Two-factor Authentication</div>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 cursor-pointer">Off</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                                        <div className="text-gray-700 dark:text-gray-300">Last Login</div>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">May 23, 2025 9:54 AM</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="text-gray-700 dark:text-gray-300">Timezone</div>
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Asia/Bangkok</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="shadow-sm bg-white dark:bg-gray-800 rounded-lg h-full relative">
                            <div className="p-4 xl:p-6 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">Notifications</h4>
                                    <span className="absolute top-5 right-5 text-xl font-bold bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">0</span> {/* badge-active */}
                                </div>
                                <div className="flex flex-col items-center justify-center flex-grow">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="text-teal-300 opacity-30" viewBox="0 0 16 16">
                                        <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 0 1 .02-.022zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486-.943 1.179z"></path>
                                    </svg>
                                    <div className="mt-1 text-gray-500 text-sm">No unread notifications</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1">
  <div className="shadow-sm bg-white dark:bg-gray-800 rounded-lg h-full relative">


    <div className="p-4 xl:p-6 flex flex-col h-full relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">My Credits</h4>
        <button className="text-xs text-blue-600 dark:text-blue-300 hover:underline">Top up</button>
      </div>

      <div className="mb-4 text-sm">
        <p className="text-gray-700 dark:text-gray-300">
          💰 <strong>Remaining:</strong> <span className="text-green-600 dark:text-green-400">55 Credits</span>
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          You can use credits to launch instances, buy storage, and more.
        </p>
      </div>

      <table className="w-full text-sm text-gray-700 dark:text-gray-300">
        <thead>
          <tr>
            <td className="text-left">Period</td>
            <td className="text-right">Used</td>
            <td className="text-right">Remaining</td>
            <td className="text-right">Total</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Week</td>
            <td className="text-right text-yellow-600 dark:text-yellow-400">12</td>
            <td className="text-right text-green-600 dark:text-green-400">88</td>
            <td className="text-right text-blue-600 dark:text-blue-400">100</td>
          </tr>
          <tr>
            <td>Month</td>
            <td className="text-right text-yellow-600 dark:text-yellow-400">45</td>
            <td className="text-right text-green-600 dark:text-green-400">55</td>
            <td className="text-right text-blue-600 dark:text-blue-400">100</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

                </div>
            </div>

            {/* Delete Server Modal */}
            
           
         
        </div>
    );
}