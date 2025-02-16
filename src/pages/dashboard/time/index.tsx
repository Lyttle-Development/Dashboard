import { Layout } from "@/layouts";
import { Container } from "@/components/Container";
import { faListCheck, faPrint } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

export function Page() {
  return (
    <Container>
      <h1>Time</h1>
      <Button href="/dashboard/time/project">
        <Icon icon={faListCheck}>Projects</Icon>
      </Button>
      <Button href="/dashboard/time/print-job">
        <Icon icon={faPrint}>Print Jobs</Icon>
      </Button>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
