// 型定義ファイル

// アンケートの質問タイプ
export type QuestionType = 'participation' | 'multiple-choice' | 'text';

// 参加可否の選択肢
export type ParticipationStatus = 'yes' | 'no' | 'undecided';

// 質問インターフェース
export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];  // multiple-choice の場合の選択肢
  required: boolean;
}

// アンケートインターフェース
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// 回答インターフェース
export interface Answer {
  questionId: string;
  value: string | string[];  // 単一選択または複数選択
}

// レスポンス（アンケート回答）インターフェース
export interface Response {
  id: string;
  surveyId: string;
  respondentName: string;
  answers: Answer[];
  submittedAt: string;
}

// 組織設定インターフェース
export interface OrganizationSettings {
  name: string;
  employees: string[];  // 事前登録された従業員名リスト
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// フォーム用の型
export interface SurveyFormData {
  title: string;
  description: string;
  questions: Question[];
}

export interface ResponseFormData {
  respondentName: string;
  answers: Answer[];
}
