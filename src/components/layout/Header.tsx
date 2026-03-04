interface HeaderProps {
  updatedLabel: string;
}

export default function Header({ updatedLabel }: HeaderProps) {
  return (
    <header>
      <div className="header-inner">
        <div className="logo">CBB<span>Analytics</span></div>
        <div className="header-meta">
          2025–26 Season<br />
          <span>{updatedLabel}</span>
        </div>
      </div>
    </header>
  );
}
