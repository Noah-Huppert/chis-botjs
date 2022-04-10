import { Sequelize, DataTypes, Model } from "sequelize";
import dotenv from "dotenv";
import moment from "moment-timezone";
import userTime from "user-time";
import { logger } from "./bot";
import { timezone as defaultTimezone } from "./config";

// Database Environment Vars
dotenv.config();
const db = process.env.DATABASE!;
const user = process.env.POSTGRES_USER!;
const pass = process.env.POSTGRES_PASSWORD!;
const host = process.env.POSTGRES_HOST!;
const develop = process.env.DEVELOP!;

/**
 * Format of the Plan.time field.
 * https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/
 */
export const PLAN_TIME_FORMAT = "H:mm:ss";

// Configure Database
const sequelize = new Sequelize(db, user, pass, {
  host: host,
  dialect: "postgres",
});

// Construct Models
export class Plan extends Model {
  declare id: string;
  declare title: string;
  declare spots: number;
  declare participants: string[];
	
	/**
	 * The time at which the plan will take place. Stored in UTC.
	 * The format is either {@link PLAN_TIME_FORMAT} or an arbitrary string which does not represent a computer known time (ex., "when we get back from the movie").
	 */
	declare time?: string;
	
  declare messageId: string;
  declare channelId: string;
}

/**
 * Configures the timezone with which a user wishes to view times.
 */
export class UserTzConfig extends Model {
  /**
	 * Unique identifier of timezone configuration entity.
	 */
  declare id: number;

  /**
	 * Discord ID of the user to which the timezone configuration pertains.
	 */
  declare userId: string;

  /**
	 * The timezone specifier string. Taken from MomentJS's list of timezones, which they say are sourced from: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
	 */
  declare timezone: string;
}

// Initialize Plan
Plan.init(
  {
    id: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      defaultValue: ":notebook_with_decorative_cover: Game Plan",
      allowNull: false,
    },
    spots: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      allowNull: false,
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      allowNull: false,
    },
		time: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
    messageId: DataTypes.TEXT,
    channelId: DataTypes.TEXT,
  },
  {
    tableName: "plan",
    sequelize, // passing the `sequelize` instance is required
  }
);

UserTzConfig.init(
  {
	  id: {
		  type: DataTypes.INTEGER,
		  unique: true,
		  allowNull: false,
		  primaryKey: true,
			autoIncrement: true,
	  },
	  userId: {
		  type: DataTypes.STRING,
		  allowNull: false,
		  unique: true,
	  },
	  timezone: {
		  type: DataTypes.STRING,
		  allowNull: false,
	  },
  },
  {
    tableName: "user_tz_config",
    sequelize, // passing the `sequelize` instance is required
  }
);

// CRUD
export class Database {
  guildId: any;
  constructor(guildId: any) {
    this.guildId = guildId;
  }
  async create(user: string, title?: string, spots?: number, time?: string) {
    await this.delete();
    return await Plan.create({
      id: this.guildId,
      title: title,
      spots: spots,
      participants: [user],
			time: time,
    });
  }
  async read() {
    return await Plan.findByPk(this.guildId);
  }

  async update(plan: { save: () => any }) {
    return await plan.save();
  }

  async delete() {
    const plan = await this.read();
    if (plan) await plan.destroy();
  }

  async join(user: any) {
    var plan = await this.read();
    if (!plan) return await this.create(user);

    const participants = Object.assign([], plan.participants);
    const spots = plan.spots;

    if (participants.includes(user) || !(participants.length < spots)) return;
    participants.push(user);

    plan.participants = participants;

    return await this.update(plan);
  }

  async leave(user: any) {
    const plan = await this.read();
    if (!plan) return;

    const participants = Object.assign([], plan.participants);

    if (!participants.includes(user)) return;

    plan.participants = participants.filter((u: any) => u != user);
    return await this.update(plan);
  }

  async rename(title: any) {
    const plan = await this.read();
    if (!plan) return;

    plan.title = title;

    return await this.update(plan);
  }

  async lastMessage(channelId: any, messageId: any) {
    const plan = await this.read();
    if (!plan) return;

    plan.channelId = channelId;
    plan.messageId = messageId;

    return await this.update(plan);
  }

	/**
	 * Update or create a user's timezone preference.
	 */
  async saveUserTz(userId: string, timezone: string): Promise<void> {
		const userTzConfig = await UserTzConfig.findOne({ where: { userId } });
		if (userTzConfig === null) {
			// No config entry present
			UserTzConfig.create({
				userId,
				timezone,
			});
			return;
		}

		userTzConfig.timezone = timezone;
		await userTzConfig.save();
	}

	/**
	 * @returns The stored timezone for the user or null if not set.
	 */
	async getUserTz(userId: string): Promise<string | null> {
		const userTzConfig = await UserTzConfig.findOne({ where: { userId } });
		if (userTzConfig === null) {
			return null;
		}

		return userTzConfig.timezone;
	}

	/**
	 * Given a vague user input time get a UTC time.
	 * Takes into account the user's timezone.
	 * @returns Moment in UTC formatted for the database if timeInput was valid, otherwise returns undefined.
	 */
	async  parseUserTimeInput(userId: string, timeInput: string): Promise<string | undefined> {
		let utcTime = undefined;

		// Find user's timezone or use default
		let userTz = await this.getUserTz(userId);
		if (userTz === null) {
			userTz = defaultTimezone;
		}

		// Oftset based on timezone
		let cleanInputTime = "";
		try {
			cleanInputTime = userTime(timeInput, { defaultTimeOfDay: "pm" }).ISOString;
		} catch (e) {
			return;
		}

		if (cleanInputTime.length > 0) {
			const noTzTimeStr = moment(cleanInputTime).format(PLAN_TIME_FORMAT);
			const userTzTime = moment.tz(noTzTimeStr, PLAN_TIME_FORMAT, userTz);
			
			return userTzTime.clone().utc().format(PLAN_TIME_FORMAT);
		}

		return;
	}
}

(async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");

    // Refresh Table (change to true to clear all data)
    if (parseInt(develop)) {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync({ force: false });
    }

    // Add database test commands here
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
})();
