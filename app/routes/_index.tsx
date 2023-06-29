import type { V2_MetaFunction } from "@remix-run/node";
import VideoRecorder from "~/shared/components/VideoRecorder";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Pivodio Video" },
    { name: "description", content: "Pivodio Code Challenge" },
  ];
};

export default function Index() {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center mt-[10vh] pt-6 md:pt-8">
      <h1 className="text-3xl font-bold text-center">Pivodio Recording Interface</h1>
      <VideoRecorder />
    </div>
  );
}
