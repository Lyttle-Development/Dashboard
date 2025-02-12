import { Select } from "@/components/select";

interface TopicSelectProps {
  setTopic: (topic: string) => void;
}

export function TopicSelect({ setTopic }: TopicSelectProps) {
  return (
    <>
      <h2>Please select a topic to report.</h2>
      <Select
        label="Select a topic"
        options={[
          { value: "project", children: "Project" },
          { value: "print-job", children: "Print Job" },
        ]}
        onValueChange={setTopic}
      />
    </>
  );
}
