package config

type Config struct {
	ProxyAddr     string
	APIAddr       string
	TargetBaseURL string
	DBPath        string
	LogLevel      string
	ConfigFile    string
}

func Load(cfg *Config) error {
	return nil
}

