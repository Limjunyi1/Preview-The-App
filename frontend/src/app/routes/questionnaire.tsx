import ChatInterface from "@/features/questionnaire/components/chat-interface";
import { categories } from "@/features/questionnaire/constants/categories";

const Questionnaire = () => {
  return <ChatInterface categories={categories} />;
};

export default Questionnaire;
