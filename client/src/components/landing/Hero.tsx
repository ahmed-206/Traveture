import { LuSearch } from "react-icons/lu";

const Hero = () => {
  return (
    <section
      className="relative  ml-[calc(-50vw+50%)] min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-center px-6 text-white  z-10"
      style={{ backgroundImage: `url('/img/bg.jpg')` }}
    >
 

      {/* Content */}
      <div className="relative z-10 max-w-225 px-4">
        <h1 className="font-headings text-5xl md:text-[84px] font-extrabold uppercase tracking-tight leading-none text-white ">
          Traveture
        </h1>
        <p className="mt-4 font-body text-lg md:text-2xl font-light opacity-90 tracking-wide text-white">
          Discover Egypt Like Never Before
        </p>
      </div>

      {/* Search */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-3xl px-6 z-10">
        <form 
          className="w-full bg-white  pl-6 rounded-input shadow-xl flex items-stretch justify-between overflow-hidden"
        >
          <input 
            type="text" 
          
            placeholder="Search destinations..." 
            className="w-full bg-transparent text-heading  text-lg py-6 pr-4 outline-none border-none font-medium"
          />
          <button 
            type="submit"
            className="shrink-0 p-6 bg-primary hover:bg-primary-700 text-white  transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer ml-2 hover:scale-105"
          >
            <LuSearch size={24}/>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;

