import { styled } from "@kuma-ui/core";

type Props = {
  name: string;
};

const Section = styled("section")`
  padding: 0.5rem 0 0.2rem 0;
  margin-bottom: 0.2rem;
  background-image: linear-gradient(
    109.6deg,
    rgba(0, 0, 30, 1) 11.2%,
    rgba(128, 162, 245, 1) 91.1%
  );
  background-repeat: no-repeat;
  background-size: 100% 6px;
  background-position: bottom;
  color: #353535;
  font-weight: bold;
  font-size: 26px;
`;

export const SeasonSection: React.FC<Props> = ({ name }) => <Section>{name}</Section>;
