import { FaGithub } from "react-icons/fa6";

function App() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <header className="fixed top-0 left-0 w-full z-10 border-b-[0.5px] border-b-gray-600 md:border-none">
        <div className="container flex flex-col md:flex-row items-center justify-between py-4 gap-2">
          <p className="font-medium text-sm text-gray-400 tracking-wider">
            React Dialect | <span className="font-mono">v0.5.0</span>
          </p>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kwameopareasiedu/react-dialect"
              className="flex items-center gap-2 border-2 border-gray-600 px-2 py-1 rounded-lg"
              target="_blank">
              <FaGithub className="fill-white" />
              <p className="font-medium text-sm text-gray-400">Github Repository</p>
            </a>

            <a
              href="https://www.buymeacoffee.com/kwameopareasiedu"
              className="inline-flex items-center gap-2 rounded-lg h-8"
              target="_blank">
              <img
                src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                className="w-full h-full object-contain"
                alt="buymeacoffee"
              />
            </a>
          </div>
        </div>
      </header>

      <section className="relative grid place-items-center w-full h-screen overflow-hidden">
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black font-impact text-[128px] md:text-[384px] text-black/10 whitespace-nowrap tracking-widest pointer-events-none">
          react-dialect
        </h1>

        <div className="container grid grid-cols-12 z-10">
          <div className="flex flex-col col-span-12 md:col-span-8">
            <p className="inline font-mono text-gray-400 text-center md:text-start">react-dialect</p>

            <h1 className="text-5xl md:text-[64px] font-semibold text-center md:text-start bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent py-4 md:py-0 leading-tight">
              Next Gen I18n For React
            </h1>

            <p>
              <strong>react-dialect</strong> is a lightweight minimal package which takes away the pain of setting up
              internationalization (i18n) in your awesome project. This package features:
            </p>

            <hr className="border-gray-700 my-6 w-96" />

            <ul className="list-disc px-4 flex flex-col gap-1">
              <li>
                <p>
                  Polymorphic <span className="font-mono">&lt;Translate /&gt;</span> Component
                </p>
              </li>
              <li>
                <p>Automatic Translation Key Generation</p>
              </li>
              <li>
                <p>Seamless Variable Interpolation</p>
              </li>
              <li>
                <p>Lazy Loading Of Translations</p>
              </li>
              <li>
                <p className="text-gray-400">
                  <span>
                    JSX Parsing In <span className="font-mono">&lt;Translate /&gt;</span> Component
                  </span>
                  <span>&nbsp;-&nbsp;</span>
                  <span className="font-bold tracking-wider">
                    <span className="text-[#ec4899] animate-[pulse_1s_ease-in-out_infinite]">C</span>
                    <span className="text-[#e946a1] animate-[pulse_1s_100ms_ease-in-out_infinite]">o</span>
                    <span className="text-[#e644a9] animate-[pulse_1s_200ms_ease-in-out_infinite]">m</span>
                    <span className="text-[#e144b1] animate-[pulse_1s_300ms_ease-in-out_infinite]">i</span>
                    <span className="text-[#db45ba] animate-[pulse_1s_400ms_ease-in-out_infinite]">n</span>
                    <span className="text-[#d546c3] animate-[pulse_1s_500ms_ease-in-out_infinite]">g</span>
                    <span className="text-[#cd48cb] animate-[pulse_1s_600ms_ease-in-out_infinite]">&nbsp;</span>
                    <span className="text-[#c34bd4] animate-[pulse_1s_700ms_ease-in-out_infinite]">S</span>
                    <span className="text-[#b94fdd] animate-[pulse_1s_800ms_ease-in-out_infinite]">o</span>
                    <span className="text-[#ac53e6] animate-[pulse_1s_900ms_ease-in-out_infinite]">o</span>
                    <span className="text-[#9d57ee] animate-[pulse_1s_1000ms_ease-in-out_infinite]">n</span>
                    <span className="text-[#8b5cf6] animate-[pulse_1s_1100ms_ease-in-out_infinite]">!</span>
                  </span>
                </p>
              </li>
            </ul>

            <hr className="border-gray-700 my-6 w-48" />

            <div>
              <a
                href="https://github.com/kwameopareasiedu/react-dialect?tab=readme-ov-file#react-dialect"
                target="_blank">
                <button className="w-full md:w-auto px-12 py-4 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 border-2 border-gray-800 font-semibold text-xl transition-all">
                  Get Started
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 w-full z-10">
        <div className="container flex flex-col md:flex-row items-center justify-between py-4">
          <p className="font-medium text-sm text-gray-400 tracking-wider">
            Developed by{" "}
            <a className="underline" href="https://github.com/kwameopareasiedu" target="_blank">
              Kwame Opare Asiedu
            </a>
          </p>

          <p className="font-medium text-sm text-gray-400 tracking-wider">MIT License, 2024</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
