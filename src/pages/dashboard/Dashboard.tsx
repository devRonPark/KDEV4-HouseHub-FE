'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Home, FileText, Users, CheckCircle, ArrowRight } from 'react-feather';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import ChartContainer from '../../components/dashboard/ChartContainer';
import { useToast } from '../../context/useToast';
import { getDashboardStats, getRecentProperties, getChartData } from '../../api/dashboard';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';
import { ChartData, RecentProperty } from '../../types/dashboard';

const Dashboard: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProperties: number;
    activeContracts: number;
    newCustomers: number;
    completedContracts: number;
  } | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [propertyChartData, setPropertyChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [contractChartData, setContractChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });

  // 데이터 로딩 함수
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 대시보드 통계 데이터 로드
      const statsResponse = await getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        showToast(statsResponse.error || '대시보드 통계를 불러오는데 실패했습니다.', 'error');
      }

      // 최근 매물 데이터 로드
      const propertiesResponse = await getRecentProperties(5);
      if (propertiesResponse.success && propertiesResponse.data) {
        setRecentProperties(propertiesResponse.data);
      } else {
        showToast(propertiesResponse.error || '최근 매물 정보를 불러오는데 실패했습니다.', 'error');
      }

      // 매물 차트 데이터 로드
      const propertyChartResponse = await getChartData('properties');
      if (propertyChartResponse.success && propertyChartResponse.data) {
        setPropertyChartData(propertyChartResponse.data);
      }

      // 계약 차트 데이터 로드
      const contractChartResponse = await getChartData('contracts');
      if (contractChartResponse.success && contractChartResponse.data) {
        setContractChartData(contractChartResponse.data);
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      showToast('대시보드 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // 초기 데이터 로딩
  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="pb-5 mb-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <button
          onClick={loadDashboardData}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* 핵심 요약 정보 카드 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="총 보유 매물 수"
              value={stats?.totalProperties || 0}
              icon={<Home className="h-6 w-6 text-blue-600" />}
            />
            <StatCard
              title="진행 중인 계약 수"
              value={stats?.activeContracts || 0}
              icon={<FileText className="h-6 w-6 text-indigo-600" />}
            />
            <StatCard
              title="신규 고객 수 (7일)"
              value={stats?.newCustomers || 0}
              icon={<Users className="h-6 w-6 text-green-600" />}
            />
            <StatCard
              title="이번 달 완료 계약 수"
              value={stats?.completedContracts || 0}
              icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            />
          </div>

          {/* 차트 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {propertyChartData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">매물 유형별 현황</h2>
                <ChartContainer
                  data={propertyChartData}
                  type="pie"
                  height={250}
                  options={{
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            )}

            {contractChartData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">월별 계약 현황</h2>
                <ChartContainer
                  data={contractChartData}
                  type="bar"
                  height={250}
                  options={{
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* 최근 등록 매물 리스트 */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">최근 등록 매물</h2>
              <Link
                to="/properties"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                전체보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        매물 유형
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        위치
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        등록일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProperties.length > 0 ? (
                      recentProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{property.propertyType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{property.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(property.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          등록된 매물이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
