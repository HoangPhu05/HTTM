import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Header from '../components/Header';

const About = () => {
  const [sysInfo, setSysInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await apiClient.getSystemInfo();
        setSysInfo(response.data);
      } catch (error) {
        console.error('Error fetching system info:', error);
      }
    };

    fetchInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Header 
          title="ℹ️ Giới thiệu Hệ thống"
          subtitle="Hệ thống Giám sát Chất lượng Không khí trong Phòng học"
        />

        {/* System Info */}
        {sysInfo && (
          <div className="card">
            <h3 className="text-2xl font-bold mb-4">{sysInfo.name}</h3>
            <p className="text-gray-700 mb-4">{sysInfo.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><span className="font-semibold">Phiên bản:</span> {sysInfo.version}</div>
            </div>

            <h4 className="text-lg font-bold mb-3">✨ Tính năng chính:</h4>
            <ul className="space-y-2 ml-4">
              {sysInfo.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* System Architecture */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🏗️ Kiến trúc Hệ thống</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="p-4 bg-blue-50 rounded border-l-4 border-l-blue-500">
              <div className="font-bold text-blue-900">📊 Dữ liệu cảm biến/CSV</div>
              <p className="mt-1">Đọc dữ liệu từ file CSV hoặc cảm biến thực</p>
            </div>
            <div className="text-center text-2xl">⬇️</div>
            <div className="p-4 bg-green-50 rounded border-l-4 border-l-green-500">
              <div className="font-bold text-green-900">⚙️ Xử lý Dữ liệu</div>
              <p className="mt-1">Làm sạch, chuẩn hóa dữ liệu, kiểm tra thống kê</p>
            </div>
            <div className="text-center text-2xl">⬇️</div>
            <div className="p-4 bg-purple-50 rounded border-l-4 border-l-purple-500">
              <div className="font-bold text-purple-900">🔍 Kiểm tra Ngưỡng</div>
              <p className="mt-1">So sánh với các giá trị ngưỡng được định nghĩa</p>
            </div>
            <div className="text-center text-2xl">⬇️</div>
            <div className="p-4 bg-red-50 rounded border-l-4 border-l-red-500">
              <div className="font-bold text-red-900">🧠 Fuzzy Logic Control</div>
              <p className="mt-1">Fuzzification → Rule Evaluation → Defuzzification</p>
            </div>
            <div className="text-center text-2xl">⬇️</div>
            <div className="p-4 bg-yellow-50 rounded border-l-4 border-l-yellow-500">
              <div className="font-bold text-yellow-900">🌬️ Điều khiển Quạt/Thông gió</div>
              <p className="mt-1">Output: Mức thông gió (Low/Medium/High)</p>
            </div>
            <div className="text-center text-2xl">⬇️</div>
            <div className="p-4 bg-orange-50 rounded border-l-4 border-l-orange-500">
              <div className="font-bold text-orange-900">📱 Hiển thị Cảnh báo & Dashboard</div>
              <p className="mt-1">Giao diện web hiển thị trực quan kết quả</p>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {sysInfo && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">📝 Thông số Hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-600 mb-3">📊 Các chỉ số được theo dõi:</h4>
                <ul className="space-y-2 text-sm">
                  {sysInfo.parameters.map((param, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2">📌</span>
                      <span>{param}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-green-600 mb-3">🎯 Mục tiêu điều khiển:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Duy trì CO2 &lt; 800 ppm</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Gibadnrữ PM2.5 &lt; 35 µg/m³</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Duy trì độ ẩm 40-70%</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Tối ưu hóa mức thông gió</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Technology Stack */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">💻 Công nghệ Sử dụng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-blue-600 mb-3">Frontend</h4>
              <ul className="space-y-1 text-sm">
                <li>⚛️ React 18.2</li>
                <li>🎨 Tailwind CSS</li>
                <li>📊 Recharts</li>
                <li>⚡ Vite</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-green-600 mb-3">Backend</h4>
              <ul className="space-y-1 text-sm">
                <li>🐍 Python 3.9+</li>
                <li>⚡ FastAPI</li>
                <li>📊 Pandas</li>
                <li>🧠 Scikit-Fuzzy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-purple-600 mb-3">Dữ liệu</h4>
              <ul className="space-y-1 text-sm">
                <li>📁 CSV File</li>
                <li>📈 Pandas DataFrame</li>
                <li>⏰ Real-time Updates</li>
                <li>🔄 Data Simulation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Research Background */}
        <div className="card border-l-4 border-l-blue-500 bg-blue-50">
          <h3 className="text-xl font-bold mb-4">📚 Nền tảng Nghiên cứu</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Fuzzy Logic Control</span> là một phương pháp điều khiển 
              dựa trên lý thuyết tập mờ (Fuzzy Set Theory). Thay vì chỉ sử dụng các giá trị nhị phân (có/không), 
              lý thuyết mờ cho phép các giá trị trung gian, giúp mô phỏng tốt hơn cách suy luận của con người.
            </p>
            <p>
              <span className="font-semibold">Ứng dụng trong chất lượng không khí:</span> Hệ thống sử dụng 
              các luật mờ để quyết định mức thông gió dựa trên nhiều chỉ số môi trường. Thay vì thiết lập 
              các ngưỡng cứng nhắc, Fuzzy Logic cho phép sự chuyển đổi mềm mại giữa các mức độ khác nhau.
            </p>
            <p>
              <span className="font-semibold">Lợi ích:</span> Giảm năng lượng tiêu thụ, cải thiện thoải mái, 
              phản ứng nhanh với thay đổi môi trường, và thích nghi với các điều kiện khác nhau.
            </p>
          </div>
        </div>

        {/* Project Team */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">👥 Thông tin Dự án</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Đề tài:</span>
              <p className="font-semibold text-lg">
                Hệ thống giám sát chất lượng không khí trong phòng học/lớp học 
                và điều khiển thiết bị bằng Fuzzy Logic Control
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Mục đích:</span>
              <p className="mt-1">
                Xây dựng một hệ thống thông minh để giám sát và điều khiển chất lượng không khí trong phòng học, 
                giúp cải thiện sức khỏe và hiệu suất học tập của học sinh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
