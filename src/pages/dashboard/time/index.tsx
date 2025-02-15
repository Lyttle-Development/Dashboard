import { Layout } from "@/layouts";
import { Link } from "@/components/Link";
import { Container } from "@/components/Container";
import { faListCheck, faPrint } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/Icon";

export function Page() {
  return (
    <Container>
      <h2>Select a time type.</h2>
      <Link href="/dashboard/time/project">
        <Icon icon={faListCheck}>Projects</Icon>
      </Link>
      <Link href="/dashboard/time/print-job">
        <Icon icon={faPrint}>Print Jobs</Icon>
      </Link>
    </Container>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
