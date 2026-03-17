import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useI18n } from "../i18n";

export default function Info({ open, handleClose, config }) {
  const { locale, t } = useI18n();

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t("info.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography variant="h6" component="h3">
              {t("info.credits")}
            </Typography>
            <List>
              <ListItem
                button
                onClick={() =>
                  (window.location.href = "https://github.com/Rosemoe")
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Rosemoe"
                    src="https://avatars.githubusercontent.com/Rosemoe"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Rosemoe"
                  secondary={t("info.contributorRosemoe")}
                />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://x.com/Xestarrrr")
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Contributors"
                    src="https://pbs.twimg.com/profile_images/1829853648521723905/rnRP3FCZ_400x400.jpg"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Xestarrrr"
                  secondary={t("info.contributorXestarrrr")}
                />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://github.com/TheOriginalAyaka")
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt="Ayaka"
                    src="https://avatars.githubusercontent.com/TheOriginalAyaka"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary="Ayaka"
                  secondary={t("info.contributorAyaka")}
                />
              </ListItem>
            </List>
            <Typography variant="h6" component="h3">
              {t("info.sourceCode")}
            </Typography>
            <List>
              <ListItem
                button
                onClick={() =>
                  (window.location.href =
                    "https://github.com/Rosemoe/arcaea-stickers")
                }
              >
                <ListItemAvatar>
                  <Avatar
                    alt="GitHub"
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  />
                </ListItemAvatar>
                <ListItemText primary="GitHub" secondary={t("info.sourceCodeLabel")} />
              </ListItem>
            </List>
            <Typography variant="h6" component="h3">
              {t("info.totalStickersMade")}
              <br />
              {config?.global != null
                ? t("info.totalStickersValue", {
                    count: config.global.toLocaleString(locale),
                  })
                : t("app.notAvailable")}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" autoFocus>
            {t("info.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
