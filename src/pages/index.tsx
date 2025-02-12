import { Layout } from "@/layouts";

function Page() {
  return (
    <>
      <h1>Hello World</h1>
    </>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
