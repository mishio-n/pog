import { styled } from "@kuma-ui/core";

type Props = {
  name: string;
};

const Section = styled("section")`
  padding: 0.8rem 0;
  margin-bottom: 0.2rem;
  background-image: linear-gradient(
    109.6deg,
    rgba(238, 58, 136, 1) 11.2%,
    rgba(128, 162, 245, 1) 91.1%
  );
  background-repeat: no-repeat;
  background-size: 100% 10px;
  background-position: bottom;
  color: #353535;
  font-weight: bold;
  font-size: 26px;
`;

export const SeasonSection: React.FC<Props> = ({ name }) => <Section>{name}</Section>;
