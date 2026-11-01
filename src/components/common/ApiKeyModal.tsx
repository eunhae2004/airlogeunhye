import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, AlertCircle, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { airService, ApiStatusResponse } from '../../services/airService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatusResponse | null;
  onStatusUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onStatusUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await airService.setApiKey(apiKeyInput.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.message || '인증키가 서버에 안전하게 등록되었습니다.',
        });
        onStatusUpdated();
      } else {
        setFeedback({
          type: 'error',
          text: '인증키 등록에 실패했습니다.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: '서버 통신 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToSimulation = async () => {
    setIsLoading(true);
    try {
      await airService.setApiKey('');
      setApiKeyInput('');
      setFeedback({
        type: 'info',
        text: 'API 키가 해제되어 테스트 데이터 모드로 전환되었습니다.',
      });
      onStatusUpdated();
    } catch {
      setFeedback({
        type: 'error',
        text: '설정 초기화 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">에어코리아 OpenAPI 연동 설정</h2>
              <p className="text-xs text-slate-500">공공데이터포털(data.go.kr) 인증키 보안 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Security highlight */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">보안 아키텍처 안내:</strong>
              입력하신 인증키는 클라이언트 브라우저 자바스크립트 코드에 노출되지 않으며, 서버 측 프록시 엔드포인트에서만 안전하게 관리되어 에어코리아 공공 API를 호출합니다.
            </div>
          </div>

          {/* Current Status */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs font-semibold text-slate-800">현재 데이터 소스: </span>
                <span className={`text-xs font-bold ${apiStatus?.hasApiKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {apiStatus?.hasApiKey ? '에어코리아 실시간 공공 API' : '테스트용 시뮬레이션 데이터'}
                </span>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
              {apiStatus?.keySource === 'env' ? '환경변수(.env)' : (apiStatus?.keySource === 'runtime' ? '실행 세션 등록' : '키 미입력')}
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                공공데이터포털 일반 인증키 (Encoding 또는 Decoding 키)
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="예: %2FsR4p7v... 또는 일반 텍스트 인증키"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !apiKeyInput.trim()}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                인증키 적용 및 실시간 연동
              </button>
              {apiStatus?.hasApiKey && (
                <button
                  type="button"
                  onClick={handleResetToSimulation}
                  disabled={isLoading}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  테스트 모드로 전환
                </button>
              )}
            </div>
          </form>

          {/* Guide to get API Key */}
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1.5">
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <span>💡 공공데이터포털 인증키 발급 방법</span>
            </p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>공공데이터포털 (data.go.kr) 회원가입 및 로그인</li>
              <li>[한국환경공단_에어코리아_대기오염정보] 오픈API 활용신청 (자동 승인)</li>
              <li>마이페이지 &gt; 개발계정에서 '일반 인증키' 복사 후 위 입력창에 등록</li>
            </ol>
            <a
              href="https://www.data.go.kr/data/15073861/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium mt-1"
            >
              공공데이터포털 에어코리아 API 신청 페이지 열기
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
