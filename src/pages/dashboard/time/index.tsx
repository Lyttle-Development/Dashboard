import { Layout } from "@/layouts";

export function Page() {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  );
}

Page.getLayout = Layout.getDefault;

export default Page;
