import { Layout } from "@/layouts";
import { Container } from "@/components/Container";

function Page() {
  return (
    <Container>
      <h1>Welcome</h1>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
