type Props = {
  name: string;
};

export const SeasonSection: React.FC<Props> = ({ name }) => (
  <section className="season-section">{name}</section>
);
