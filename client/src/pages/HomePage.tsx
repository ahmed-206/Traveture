import ChooseUs from "../components/landing/ChooseUs";
import Cta from "../components/landing/Cta";
import Destinations from "../components/landing/Destinations";
import Hero from "../components/landing/Hero";
import Tours from "../components/landing/Tours";
import MainLayout from "../layouts/MainLayout";

const Home = () => {
  return (
    <MainLayout>
     <Hero />
     <Destinations />
     <Tours />
     <ChooseUs />
     <Cta />
    </MainLayout>
  );
};

export default Home;
