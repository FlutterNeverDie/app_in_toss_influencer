export interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ_DATA: FAQItem[] = [
    {
        question: "인플루언서 등록은 어떻게 하나요?",
        answer: "인스타그램 ID와 활동 지역을 남겨주시면, 검토 후 등록해 드립니다. 인플루언서 등록 탭을 통해 신청해 주세요!"
    },
    {
        question: "등록 비용이 드나요?",
        answer: "아니요, 모든 등록 및 노출은 100% 무료로 제공됩니다."
    },
    {
        question: "지역을 변경하고 싶어요.",
        answer: "이사 등으로 활동 지역이 변경된 경우, 고객센터로 문의 주시면 빠르게 수정해 드립니다."
    },
    {
        question: "내 정보가 노출되는 것이 싫어요.",
        answer: "언제든지 삭제 요청이 가능합니다. 고객센터로 삭제 요청을 보내주시면 48시간안에 처리해 드립니다."
    }
];
