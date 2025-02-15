import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { Select } from "@/components/Select";

function Page() {
  return (
    <Container>
      <h1>Create Project</h1>
      <Select
        label="Select Category"
        options={[
          {
            label: "Category 1",
            value: "category-1",
          },
        ]}
      />
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
