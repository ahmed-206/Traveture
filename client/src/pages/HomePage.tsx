import AboutUs from "../components/landing/AboutUs";
import ChooseUs from "../components/landing/ChooseUs";
import Cta from "../components/landing/Cta";
import Destinations from "../components/landing/Destinations";
import Hero from "../components/landing/Hero";
import Tours from "../components/landing/Tours";

const Home = () => {
  return (
    <main className="w-full overflow-x-hidden">
      <Hero />
      <Destinations />
      <Tours />
      <AboutUs />
      <ChooseUs />
      <Cta />
    </main>
  );
};

export default Home;
